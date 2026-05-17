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
  const rev: Record<string, string> = {
    stockCurrent: "stock_current",
    stockInitial: "stock_initial",
    lowStockThreshold: "low_stock_threshold",
  };
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(p)) {
    out[rev[key] ?? key] = val;
  }
  return out;
}

export function getStockStatus(product: Product): StockStatus {
  if (product.stockCurrent <= 0) return "critical";
  if (product.stockCurrent <= product.lowStockThreshold) return "low";
  return "ok";
}

let productsCache: Product[] = [];
let movementsCache: StockMovement[] = [];
let listeners = new Set<() => void>();
let fetchPromise: Promise<void> | null = null;

function notify() {
  listeners.forEach((l) => l());
}

async function doFetch() {
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
  if (prodRes.data) productsCache = prodRes.data.map(mapProduct);
  if (moveRes.data) movementsCache = moveRes.data.map(mapMovement);
}

export function useProducts() {
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.add(fn);
    if (productsCache.length === 0) {
      doFetch().then(notify);
    }
    return () => { listeners.delete(fn); };
  }, []);

  return {
    products: productsCache,
    movements: movementsCache,
    loading: false,
    addProduct: async (p: Omit<Product, "id" | "createdAt">) => {
      const businessId = await getBusinessId();
      if (!businessId) return;
      const { data } = await supabase
        .from("products")
        .insert({ ...unmapProduct(p), business_id: businessId })
        .select()
        .single();
      if (data) {
        const mapped = mapProduct(data);
        productsCache = [mapped, ...productsCache];
        if (p.stockInitial > 0) {
          movementsCache = [
            {
              id: data.id,
              productId: mapped.id,
              quantityChange: p.stockInitial,
              reason: "reposicion",
              createdAt: data.created_at,
            },
            ...movementsCache,
          ];
        }
        notify();
      }
      return data ? mapProduct(data) : undefined;
    },
    updateProduct: async (id: string, updates: Partial<Omit<Product, "id" | "createdAt">>) => {
      const businessId = await getBusinessId();
      if (!businessId) return;
      await supabase.from("products").update(unmapProduct(updates)).eq("id", id);
      productsCache = productsCache.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      notify();
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
        const newCurrent = Math.max(0, product.stock_current - qty);
        await supabase
          .from("products")
          .update({ stock_current: newCurrent })
          .eq("id", productId);
        productsCache = productsCache.map((p) =>
          p.id === productId ? { ...p, stockCurrent: newCurrent } : p
        );
      }
      const newMovement: StockMovement = {
        id: Date.now().toString(36),
        productId,
        quantityChange: -qty,
        reason: "venta",
        referenceSaleId: saleId,
        createdAt: new Date().toISOString(),
      };
      movementsCache = [newMovement, ...movementsCache];
      notify();
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
        const newCurrent = product.stock_current + qty;
        await supabase
          .from("products")
          .update({ stock_current: newCurrent })
          .eq("id", productId);
        productsCache = productsCache.map((p) =>
          p.id === productId ? { ...p, stockCurrent: newCurrent } : p
        );
      }
      const newMovement: StockMovement = {
        id: Date.now().toString(36),
        productId,
        quantityChange: qty,
        reason: "reposicion",
        createdAt: new Date().toISOString(),
      };
      movementsCache = [newMovement, ...movementsCache];
      notify();
    },
    getMovementsForProduct: (productId: string) =>
      movementsCache.filter((m) => m.productId === productId),
    getCriticalProducts: () =>
      productsCache.filter((p) => getStockStatus(p) === "critical"),
    getLowProducts: () =>
      productsCache.filter((p) => {
        const s = getStockStatus(p);
        return s === "low" || s === "critical";
      }),
  };
}
