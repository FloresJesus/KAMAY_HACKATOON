import { useEffect, useState } from 'react';
import { generateId } from './utils';

export type ProductUnit = 'unidades' | 'kg' | 'porciones' | 'docenas';

export type Product = {
  id: string;
  name: string;
  stockCurrent: number;
  stockInitial: number;
  unit: ProductUnit;
  price: number;
  lowStockThreshold: number;
  createdAt: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  quantityChange: number;
  reason: 'venta' | 'reposicion' | 'ajuste';
  referenceSaleId?: string;
  createdAt: string;
};

export type StockStatus = 'ok' | 'low' | 'critical';

export function getStockStatus(product: Product): StockStatus {
  if (product.stockCurrent <= 0) return 'critical';
  if (product.stockCurrent <= product.lowStockThreshold) return 'low';
  return 'ok';
}

const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'Almuerzo familiar',
    stockCurrent: 20,
    stockInitial: 50,
    unit: 'porciones',
    price: 35,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Arroz 5kg',
    stockCurrent: 3,
    stockInitial: 20,
    unit: 'unidades',
    price: 45,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Refresco',
    stockCurrent: 0,
    stockInitial: 30,
    unit: 'unidades',
    price: 7,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
];

const initialMovements: StockMovement[] = [
  {
    id: 'sm1',
    productId: 'p1',
    quantityChange: 50,
    reason: 'reposicion',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'sm2',
    productId: 'p1',
    quantityChange: -30,
    reason: 'venta',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sm3',
    productId: 'p2',
    quantityChange: 20,
    reason: 'reposicion',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'sm4',
    productId: 'p2',
    quantityChange: -17,
    reason: 'venta',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

let productListeners = new Set<() => void>();
let products: Product[] = [...initialProducts];
let movements: StockMovement[] = [...initialMovements];

function notifyProducts() {
  productListeners.forEach((l) => l());
}

export function useProducts() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((x) => x + 1);
    productListeners.add(fn);
    return () => {
      productListeners.delete(fn);
    };
  }, []);

  return {
    products,
    movements,
    addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => {
      const newProduct: Product = {
        ...p,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      products = [newProduct, ...products];
      if (p.stockInitial > 0) {
        movements = [
          {
            id: generateId(),
            productId: newProduct.id,
            quantityChange: p.stockInitial,
            reason: 'reposicion',
            createdAt: new Date().toISOString(),
          },
          ...movements,
        ];
      }
      notifyProducts();
      return newProduct;
    },
    updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
      products = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      notifyProducts();
    },
    deductStock: (productId: string, qty: number, saleId?: string) => {
      products = products.map((p) =>
        p.id === productId ? { ...p, stockCurrent: Math.max(0, p.stockCurrent - qty) } : p,
      );
      movements = [
        {
          id: generateId(),
          productId,
          quantityChange: -qty,
          reason: 'venta',
          referenceSaleId: saleId,
          createdAt: new Date().toISOString(),
        },
        ...movements,
      ];
      notifyProducts();
    },
    replenishStock: (productId: string, qty: number) => {
      products = products.map((p) =>
        p.id === productId ? { ...p, stockCurrent: p.stockCurrent + qty } : p,
      );
      movements = [
        {
          id: generateId(),
          productId,
          quantityChange: qty,
          reason: 'reposicion',
          createdAt: new Date().toISOString(),
        },
        ...movements,
      ];
      notifyProducts();
    },
    getMovementsForProduct: (productId: string) =>
      movements.filter((m) => m.productId === productId),
    getCriticalProducts: () => products.filter((p) => getStockStatus(p) === 'critical'),
    getLowProducts: () =>
      products.filter((p) => {
        const s = getStockStatus(p);
        return s === 'low' || s === 'critical';
      }),
  };
}
