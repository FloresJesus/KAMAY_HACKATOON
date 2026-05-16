// store.ts

import { useEffect, useState } from "react";

import {
  initialSales,
  type Sale,
} from "./mock-data";

let listeners = new Set<() => void>();

let sales: Sale[] = [...initialSales];

export function useSales() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => {
      forceUpdate((x) => x + 1);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const addSale = (
    sale: Omit<Sale, "id" | "date">
  ) => {
    const newSale: Sale = {
      ...sale,
      id: Math.random()
        .toString(36)
        .substring(2),
      date: new Date().toISOString(),
    };

    sales = [newSale, ...sales];

    listeners.forEach((listener) =>
      listener()
    );
  };

  const removeSale = (id: string) => {
    sales = sales.filter((s) => s.id !== id);

    listeners.forEach((listener) =>
      listener()
    );
  };

  const clearSales = () => {
    sales = [];

    listeners.forEach((listener) =>
      listener()
    );
  };

  return {
    sales,
    addSale,
    removeSale,
    clearSales,
  };
}