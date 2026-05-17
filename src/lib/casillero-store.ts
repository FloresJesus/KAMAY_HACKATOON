import { useSyncExternalStore, useEffect } from "react";
import { supabase } from "./supabase";
import { getBusinessId } from "./db";

export type CasilleroLocation = "La Paz" | "Cochabamba";
export type CasilleroSize = "PEQUEÑO" | "MEDIANO" | "GRANDE";
export type CasilleroStatus = "activo" | "recogido" | "expirado";
export type SlotStatus = "disponible" | "ocupado" | "reservado";

export type CasilleroReservation = {
  id: string;
  productId: string;
  productName: string;
  location: CasilleroLocation;
  casilleroNumber: number;
  size: CasilleroSize;
  accessPin: string;
  expiresAt: string;
  status: CasilleroStatus;
  createdAt: string;
};

export const LOCATIONS: { id: CasilleroLocation; address: string }[] = [
  { id: "La Paz", address: "Espacio Creativo Tinka LA PAZ" },
  { id: "Cochabamba", address: "Espacio Creativo Tinka COCHABAMBA" },
];

const SLOT_COUNT = 12;

const RESERVATION_MAP: Record<string, keyof CasilleroReservation> = {
  product_id: "productId",
  product_name: "productName",
  casillero_number: "casilleroNumber",
  access_pin: "accessPin",
  expires_at: "expiresAt",
  created_at: "createdAt",
};

function mapReservation(row: Record<string, unknown>): CasilleroReservation {
  const r: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    r[RESERVATION_MAP[key] ?? key] = val;
  }
  return r as unknown as CasilleroReservation;
}

export function getSlotsForLocation(
  location: CasilleroLocation,
  reservations: CasilleroReservation[]
) {
  const activeNums = new Set(
    reservations
      .filter((r) => r.location === location && r.status === "activo")
      .map((r) => r.casilleroNumber)
  );
  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const num = i + 1;
    if (activeNums.has(num))
      return { number: num, status: "reservado" as SlotStatus };
    return { number: num, status: "disponible" as SlotStatus };
  });
}

export function getSlotSize(num: number): CasilleroSize {
  if (num <= 4) return "PEQUEÑO";
  if (num <= 8) return "MEDIANO";
  return "GRANDE";
}

let reservationsCache: CasilleroReservation[] = [];
let listeners = new Set<() => void>();
let fetchPromise: Promise<void> | null = null;

function notify() {
  listeners.forEach((l) => l());
}

async function ensureFetched() {
  if (reservationsCache.length > 0) return;
  if (fetchPromise) return fetchPromise;
  fetchPromise = doFetch();
  return fetchPromise;
}

async function doFetch() {
  const businessId = await getBusinessId();
  if (!businessId) return;
  const { data } = await supabase
    .from("casillero_reservations")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (data) reservationsCache = data.map(mapReservation);
}

function subscribeToCasilleros(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function getReservationsSnapshot() {
  return reservationsCache;
}

export function clearReservationsCache() {
  reservationsCache = [];
  fetchPromise = null;
}

export async function prefetchCasilleros() {
  await ensureFetched();
}

export function useCasilleros() {
  const reservations = useSyncExternalStore(subscribeToCasilleros, getReservationsSnapshot);

  useEffect(() => {
    if (reservationsCache.length === 0) {
      ensureFetched().then(notify);
    }
  }, []);

  return {
    reservations,
    activeReservations: reservationsCache.filter((r) => r.status === "activo"),
    loading: false,
    addReservation: async (r: Omit<CasilleroReservation, "id" | "createdAt">) => {
      const optimistic: CasilleroReservation = {
        id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...r,
      };
      reservationsCache = [optimistic, ...reservationsCache];
      notify();

      const businessId = await getBusinessId();
      if (!businessId) {
        reservationsCache = reservationsCache.filter((res) => res.id !== optimistic.id);
        notify();
        return;
      }

      const { data: location } = await supabase
        .from("casillero_locations")
        .select("id")
        .eq("name", r.location)
        .single();

      if (!location) {
        reservationsCache = reservationsCache.filter((res) => res.id !== optimistic.id);
        notify();
        return;
      }

      const { data: slot } = await supabase
        .from("casillero_slots")
        .select("id")
        .eq("location_id", location.id)
        .eq("slot_number", r.casilleroNumber)
        .single();

      if (!slot) {
        reservationsCache = reservationsCache.filter((res) => res.id !== optimistic.id);
        notify();
        return;
      }

      const { data } = await supabase
        .from("casillero_reservations")
        .insert({
          business_id: businessId,
          slot_id: slot.id,
          product_id: r.productId,
          product_name: r.productName,
          location: r.location,
          casillero_number: r.casilleroNumber,
          size: r.size,
          access_pin: r.accessPin,
          expires_at: r.expiresAt,
          status: r.status,
        })
        .select()
        .single();

      if (data) {
        reservationsCache = reservationsCache.map((res) =>
          res.id === optimistic.id ? mapReservation(data) : res
        );
      } else {
        reservationsCache = reservationsCache.filter((res) => res.id !== optimistic.id);
      }
      notify();
      return data ? mapReservation(data) : undefined;
    },
    markRecogido: async (id: string) => {
      await supabase
        .from("casillero_reservations")
        .update({ status: "recogido" })
        .eq("id", id);
      reservationsCache = reservationsCache.map((r) =>
        r.id === id ? { ...r, status: "recogido" as CasilleroStatus } : r
      );
      notify();
    },
  };
}
