import { supabase } from "./supabase";

const businessIdCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

export async function getBusinessId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cached = businessIdCache.get(user.id);
  if (cached !== undefined) return cached;

  const pending = pendingRequests.get(user.id);
  if (pending) return pending;

  const promise = (async () => {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();
    const id = data?.id ?? null;
    if (id) businessIdCache.set(user.id, id);
    pendingRequests.delete(user.id);
    return id;
  })();

  pendingRequests.set(user.id, promise);
  return promise;
}

export function clearBusinessIdCache() {
  businessIdCache.clear();
  pendingRequests.clear();
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
