import { useEffect, useState } from "react";
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

export function useSales() {
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.add(fn);
    if (salesCache.length === 0) {
      doFetch().then(notify);
    }
    return () => { listeners.delete(fn); };
  }, []);

  return {
    sales: salesCache,
    loading: false,
    addSale: async (s: Omit<Sale, "id" | "date">) => {
      const businessId = await getBusinessId();
      if (!businessId) return;
      const { data } = await supabase
        .from("sales")
        .insert({ ...s, business_id: businessId })
        .select()
        .single();
      if (data) {
        salesCache = [data as unknown as Sale, ...salesCache];
        notify();
      }
    },
  };
}
