import { useEffect, useState } from "react";
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

let listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function useCasilleros() {
  const [, force] = useState(0);
  const [reservations, setReservations] = useState<CasilleroReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.add(fn);
    fetchReservations();
    return () => {
      listeners.delete(fn);
    };
  }, []);

  async function fetchReservations() {
    const businessId = await getBusinessId();
    if (!businessId) return;
    const { data } = await supabase
      .from("casillero_reservations")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
    if (data) setReservations(data.map(mapReservation));
    setLoading(false);
  }

  return {
    reservations,
    activeReservations: reservations.filter((r) => r.status === "activo"),
    loading,
    addReservation: async (
      r: Omit<CasilleroReservation, "id" | "createdAt">
    ) => {
      const businessId = await getBusinessId();
      if (!businessId) return;
      const { data } = await supabase
        .from("casillero_reservations")
        .insert({
          business_id: businessId,
          slot_id: r.productId, // placeholder - real slot_id resolution needed
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
      notify();
      await fetchReservations();
      return data ? mapReservation(data) : undefined;
    },
    markRecogido: async (id: string) => {
      await supabase
        .from("casillero_reservations")
        .update({ status: "recogido" })
        .eq("id", id);
      notify();
      await fetchReservations();
    },
  };
}
