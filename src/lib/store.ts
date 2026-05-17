import { useSyncExternalStore, useEffect } from "react";
import { supabase } from "./supabase";
import { getBusinessId } from "./db";
import type { Sale } from "./mock-data";

let salesCache: Sale[] = [];
let listeners = new Set<() => void>();
let fetchPromise: Promise<void> | null = null;

function notify() {
  listeners.forEach((l) => l());
}

async function ensureFetched() {
  if (salesCache.length > 0) return;
  if (fetchPromise) return fetchPromise;
  fetchPromise = doFetch();
  return fetchPromise;
}

async function doFetch() {
  const businessId = await getBusinessId();
  if (!businessId) return;
  const { data } = await supabase
    .from("sales")
    .select("*")
    .eq("business_id", businessId)
    .order("date", { ascending: false });
  if (data) {
    salesCache = data as unknown as Sale[];
  }
}

function subscribeToSales(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function getSalesSnapshot() {
  return salesCache;
}

export function clearSalesCache() {
  salesCache = [];
  fetchPromise = null;
}

export async function prefetchSales() {
  await ensureFetched();
}

export function useSales() {
  const sales = useSyncExternalStore(subscribeToSales, getSalesSnapshot);

  useEffect(() => {
    if (salesCache.length === 0) {
      ensureFetched().then(notify);
    }
  }, []);

  return {
    sales,
    loading: false,
    addSale: async (s: Omit<Sale, "id" | "date">) => {
      const optimistic: Sale = {
        id: `temp_${Date.now()}`,
        date: new Date().toISOString(),
        ...s,
      } as Sale;
      salesCache = [optimistic, ...salesCache];
      notify();
      const businessId = await getBusinessId();
      if (!businessId) {
        salesCache = salesCache.filter((sale) => sale.id !== optimistic.id);
        notify();
        return;
      }
      const { data } = await supabase
        .from("sales")
        .insert({ ...s, business_id: businessId })
        .select()
        .single();
      if (data) {
        salesCache = salesCache.map((sale) =>
          sale.id === optimistic.id ? (data as unknown as Sale) : sale
        );
      } else {
        salesCache = salesCache.filter((sale) => sale.id !== optimistic.id);
      }
      notify();
    },
  };
}
