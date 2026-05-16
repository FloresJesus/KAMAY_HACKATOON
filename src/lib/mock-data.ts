export type PaymentMethod = 'Efectivo' | 'QR' | 'Transferencia' | 'Otro';
export type Location = 'Tienda' | 'Feria' | 'Delivery' | 'Otro';

export type Sale = {
  id: string;
  product: string;
  category: string;
  amount: number;
  qty: number;
  method: PaymentMethod;
  location: Location;
  date: string;
};

export const CATEGORIES = [
  { id: 'food', label: 'Alimentos', icon: 'UtensilsCrossed' },
  { id: 'retail', label: 'Abarrotes', icon: 'ShoppingBag' },
  { id: 'services', label: 'Servicios', icon: 'Wrench' },
  { id: 'crafts', label: 'Artesanía', icon: 'Palette' },
  { id: 'beauty', label: 'Belleza', icon: 'Scissors' },
  { id: 'other', label: 'Otros', icon: 'Package' },
] as const;

export const PAYMENT_METHODS: { id: PaymentMethod; icon: string }[] = [
  { id: 'Efectivo', icon: 'Banknote' },
  { id: 'QR', icon: 'QrCode' },
  { id: 'Transferencia', icon: 'Landmark' },
  { id: 'Otro', icon: 'MoreHorizontal' },
];

export const LOCATIONS: { id: Location; icon: string }[] = [
  { id: 'Tienda', icon: 'Store' },
  { id: 'Feria', icon: 'Tent' },
  { id: 'Delivery', icon: 'Bike' },
  { id: 'Otro', icon: 'MapPin' },
];

export const initialSales: Sale[] = [
  { id: '1', product: 'Almuerzo familiar', category: 'Alimentos', amount: 35, qty: 1, method: 'Efectivo', location: 'Tienda', date: new Date(Date.UTC(2026, 4, 16, 14, 5)).toISOString() },
  { id: '2', product: 'Refresco x2', category: 'Alimentos', amount: 14, qty: 2, method: 'QR', location: 'Tienda', date: new Date(Date.UTC(2026, 4, 16, 13, 0)).toISOString() },
  { id: '3', product: 'Manualidad bordada', category: 'Artesanía', amount: 80, qty: 1, method: 'QR', location: 'Feria', date: new Date(Date.UTC(2026, 4, 16, 11, 30)).toISOString() },
  { id: '4', product: 'Arroz 5kg', category: 'Abarrotes', amount: 45, qty: 1, method: 'Efectivo', location: 'Tienda', date: new Date(Date.UTC(2026, 4, 15, 16, 20)).toISOString() },
  { id: '5', product: 'Corte de cabello', category: 'Belleza', amount: 25, qty: 1, method: 'Efectivo', location: 'Tienda', date: new Date(Date.UTC(2026, 4, 14, 18, 5)).toISOString() },
  { id: '6', product: 'Reparación celular', category: 'Servicios', amount: 120, qty: 1, method: 'Transferencia', location: 'Tienda', date: new Date(Date.UTC(2026, 4, 13, 12, 0)).toISOString() },
  { id: '7', product: 'Pan dulce x10', category: 'Alimentos', amount: 20, qty: 10, method: 'Efectivo', location: 'Delivery', date: new Date(Date.UTC(2026, 4, 12, 9, 0)).toISOString() },
  { id: '8', product: 'Aretes tejidos', category: 'Artesanía', amount: 60, qty: 2, method: 'QR', location: 'Feria', date: new Date(Date.UTC(2026, 4, 11, 15, 0)).toISOString() },
  { id: '9', product: 'Almuerzo ejecutivo', category: 'Alimentos', amount: 28, qty: 1, method: 'Efectivo', location: 'Delivery', date: new Date(Date.UTC(2026, 4, 10, 13, 30)).toISOString() },
];
