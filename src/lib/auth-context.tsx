import { supabase } from "@/lib/supabase";
import { useRouter, useSegments } from "expo-router";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { prefetchSales, clearSalesCache } from "@/lib/store";
import { prefetchProducts, clearProductsCache } from "@/lib/product-store";
import { prefetchCasilleros, clearReservationsCache } from "@/lib/casillero-store";
import { clearBusinessIdCache } from "@/lib/db";

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const prefetched = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          clearSalesCache();
          clearProductsCache();
          clearReservationsCache();
          clearBusinessIdCache();
          prefetched.current = false;
        }
        setSession(session);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || prefetched.current) return;
    prefetched.current = true;
    Promise.all([
      prefetchSales(),
      prefetchProducts(),
      prefetchCasilleros(),
    ]);
  }, [session]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "auth";

    if (!session && !inAuthGroup) {
      router.replace("/login");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, isLoading, segments]);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
