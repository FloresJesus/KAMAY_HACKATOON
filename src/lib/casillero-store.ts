import { useEffect, useState } from 'react';
import { generateId } from './utils';

export type CasilleroLocation = 'La Paz' | 'Cochabamba';
export type CasilleroSize = 'PEQUEÑO' | 'MEDIANO' | 'GRANDE';
export type CasilleroStatus = 'activo' | 'recogido' | 'expirado';
export type SlotStatus = 'disponible' | 'ocupado' | 'reservado';

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
  { id: 'La Paz', address: 'Espacio Creativo Tinka LA PAZ' },
  { id: 'Cochabamba', address: 'Espacio Creativo Tinka COCHABAMBA' },
];

const SLOT_COUNT = 12;

export function getSlotsForLocation(location: CasilleroLocation, reservations: CasilleroReservation[]) {
  const activeNums = new Set(
    reservations
      .filter((r) => r.location === location && r.status === 'activo')
      .map((r) => r.casilleroNumber),
  );
  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const num = i + 1;
    const alwaysOccupied = [3, 7, 10];
    if (alwaysOccupied.includes(num)) return { number: num, status: 'ocupado' as SlotStatus };
    if (activeNums.has(num)) return { number: num, status: 'reservado' as SlotStatus };
    return { number: num, status: 'disponible' as SlotStatus };
  });
}

export function getSlotSize(num: number): CasilleroSize {
  if (num <= 4) return 'PEQUEÑO';
  if (num <= 8) return 'MEDIANO';
  return 'GRANDE';
}

let casilleroListeners = new Set<() => void>();
let reservations: CasilleroReservation[] = [];

function notify() {
  casilleroListeners.forEach((l) => l());
}

export function useCasilleros() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((x) => x + 1);
    casilleroListeners.add(fn);
    return () => {
      casilleroListeners.delete(fn);
    };
  }, []);

  return {
    reservations,
    activeReservations: reservations.filter((r) => r.status === 'activo'),
    addReservation: (r: Omit<CasilleroReservation, 'id' | 'createdAt'>) => {
      const newR: CasilleroReservation = {
        ...r,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      reservations = [newR, ...reservations];
      notify();
      return newR;
    },
    markRecogido: (id: string) => {
      reservations = reservations.map((r) => (r.id === id ? { ...r, status: 'recogido' } : r));
      notify();
    },
  };
}
