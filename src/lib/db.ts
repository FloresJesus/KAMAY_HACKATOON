import { supabase } from "./supabase";

export async function getBusinessId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  return data?.id ?? null;
}

export function saleToDb(s: SaleInput) {
  return {
    product: s.product,
    category: s.category,
    amount: s.amount,
    qty: s.qty,
    method: s.method,
    location: s.location,
  };
}

export type SaleInput = {
  product: string;
  category: string;
  amount: number;
  qty: number;
  method: string;
  location: string;
};
