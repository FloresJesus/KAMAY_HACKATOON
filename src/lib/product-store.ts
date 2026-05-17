import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { getBusinessId } from "./db";

export type ProductUnit = "unidades" | "kg" | "porciones" | "docenas";

export type Product = {
  id: string;
  name: string;
  stockCurrent: number;
  stockInitial: number;
  unit: ProductUnit;
  price: number;
  category: string;
  lowStockThreshold: number;
  createdAt: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  quantityChange: number;
  reason: "venta" | "reposicion" | "ajuste";
  referenceSaleId?: string;
  createdAt: string;
};

export type StockStatus = "ok" | "low" | "critical";

const PRODUCT_MAP: Record<string, keyof Product> = {
  stock_current: "stockCurrent",
  stock_initial: "stockInitial",
  low_stock_threshold: "lowStockThreshold",
  created_at: "createdAt",
};

const MOVEMENT_MAP: Record<string, keyof StockMovement> = {
  product_id: "productId",
  quantity_change: "quantityChange",
  reference_sale_id: "referenceSaleId",
  created_at: "createdAt",
};

function mapProduct(row: Record<string, unknown>): Product {
  const p: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    p[PRODUCT_MAP[key] ?? key] = val;
  }
  return p as unknown as Product;
}

function mapMovement(row: Record<string, unknown>): StockMovement {
  const m: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    m[MOVEMENT_MAP[key] ?? key] = val;
  }
  return m as unknown as StockMovement;
}

function unmapProduct(
  p: Partial<Omit<Product, "id" | "createdAt">>
): Record<string, unknown> {
  const rev: Record<string, unknown> = {};
  const reverse: Record<string, string> = {
    stockCurrent: "stock_current",
    stockInitial: "stock_initial",
    lowStockThreshold: "low_stock_threshold",
  };
  for (const [key, val] of Object.entries(p)) {
    rev[reverse[key] ?? key] = val;
  }
  return rev;
}

export function getStockStatus(product: Product): StockStatus {
  if (product.stockCurrent <= 0) return "critical";
  if (product.stockCurrent <= product.lowStockThreshold) return "low";
  return "ok";
}

let listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function useProducts() {
  const [, force] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.add(fn);
    fetchAll();
    return () => { listeners.delete(fn); };
  }, []);

  async function fetchAll() {
    const businessId = await getBusinessId();
    if (!businessId) return;
    const [prodRes, moveRes] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false }),
      supabase
        .from("stock_movements")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false }),
    ]);
    if (prodRes.data) setProducts(prodRes.data.map(mapProduct));
    if (moveRes.data) setMovements(moveRes.data.map(mapMovement));
    setLoading(false);
  }

  return {
    products,
    movements,
    loading,
    addProduct: async (p: Omit<Product, "id" | "createdAt">) => {
      const businessId = await getBusinessId();
      if (!businessId) return;
      const { data } = await supabase
        .from("products")
        .insert({ ...unmapProduct(p), business_id: businessId })
        .select()
        .single();
      if (p.stockInitial > 0 && data) {
        await supabase.from("stock_movements").insert({
          business_id: businessId,
          product_id: data.id,
          quantity_change: p.stockInitial,
          reason: "reposicion",
        });
      }
      notify();
      await fetchAll();
      return data ? mapProduct(data) : undefined;
    },
    updateProduct: async (
      id: string,
      updates: Partial<Omit<Product, "id" | "createdAt">>
    ) => {
      const businessId = await getBusinessId();
      if (!businessId) return;
      await supabase
        .from("products")
        .update(unmapProduct(updates))
        .eq("id", id);
      notify();
      await fetchAll();
    },
    deductStock: async (productId: string, qty: number, saleId?: string) => {
      const businessId = await getBusinessId();
      if (!businessId) return;
      const { data: product } = await supabase
        .from("products")
        .select("stock_current")
        .eq("id", productId)
        .single();
      if (product) {
        await supabase
          .from("products")
          .update({
            stock_current: Math.max(0, product.stock_current - qty),
          })
          .eq("id", productId);
      }
      await supabase.from("stock_movements").insert({
        business_id: businessId,
        product_id: productId,
        quantity_change: -qty,
        reason: "venta",
        reference_sale_id: saleId,
      });
      notify();
      await fetchAll();
    },
    replenishStock: async (productId: string, qty: number) => {
      const businessId = await getBusinessId();
      if (!businessId) return;
      const { data: product } = await supabase
        .from("products")
        .select("stock_current")
        .eq("id", productId)
        .single();
      if (product) {
        await supabase
          .from("products")
          .update({ stock_current: product.stock_current + qty })
          .eq("id", productId);
      }
      await supabase.from("stock_movements").insert({
        business_id: businessId,
        product_id: productId,
        quantity_change: qty,
        reason: "reposicion",
      });
      notify();
      await fetchAll();
    },
    getMovementsForProduct: (productId: string) =>
      movements.filter((m) => m.productId === productId),
    getCriticalProducts: () =>
      products.filter((p) => getStockStatus(p) === "critical"),
    getLowProducts: () =>
      products.filter((p) => {
        const s = getStockStatus(p);
        return s === "low" || s === "critical";
      }),
  };
}
