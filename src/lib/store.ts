import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { getBusinessId } from "./db";
import type { Sale } from "./mock-data";

let listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function useSales() {
  const [, force] = useState(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.add(fn);
    fetchSales();
    return () => { listeners.delete(fn); };
  }, []);

  async function fetchSales() {
    const businessId = await getBusinessId();
    if (!businessId) return;
    const { data } = await supabase
      .from("sales")
      .select("*")
      .eq("business_id", businessId)
      .order("date", { ascending: false });
    if (data) {
      setSales(data as unknown as Sale[]);
    }
    setLoading(false);
  }

  return {
    sales,
    loading,
    addSale: async (s: Omit<Sale, "id" | "date">) => {
      const businessId = await getBusinessId();
      if (!businessId) return;
      await supabase.from("sales").insert({
        ...s,
        business_id: businessId,
      });
      notify();
      await fetchSales();
    },
  };
}
