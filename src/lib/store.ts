import { useEffect, useState } from 'react';
import { initialSales, type Sale } from './mock-data';
import { generateId } from './utils';

let listeners = new Set<() => void>();
let sales: Sale[] = [...initialSales];

export function useSales() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return {
    sales,
    addSale: (s: Omit<Sale, 'id' | 'date'>) => {
      sales = [{ ...s, id: generateId(), date: new Date().toISOString() }, ...sales];
      listeners.forEach((l) => l());
    },
  };
}
