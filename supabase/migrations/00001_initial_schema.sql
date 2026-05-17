-- ============================================
-- KAMAY - Esquema Inicial para Supabase
-- Tu negocio, en tus manos
-- ============================================

-- 1. ENUMS
-- ============================================

CREATE TYPE payment_method AS ENUM ('Efectivo', 'QR', 'Transferencia', 'Otro');
CREATE TYPE sale_location AS ENUM ('Tienda', 'Feria', 'Delivery', 'Otro');
CREATE TYPE product_unit AS ENUM ('unidades', 'kg', 'porciones', 'docenas');
CREATE TYPE stock_movement_reason AS ENUM ('venta', 'reposicion', 'ajuste');
CREATE TYPE casillero_location_name AS ENUM ('La Paz', 'Cochabamba');
CREATE TYPE casillero_size AS ENUM ('PEQUEÑO', 'MEDIANO', 'GRANDE');
CREATE TYPE reservation_status AS ENUM ('activo', 'recogido', 'expirado');
CREATE TYPE slot_status AS ENUM ('disponible', 'ocupado', 'reservado');

-- 2. TABLES
-- ============================================

-- 2.1 Businesses (negocios)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Products (productos/inventario)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stock_current REAL NOT NULL DEFAULT 0,
  stock_initial REAL NOT NULL DEFAULT 0,
  unit product_unit NOT NULL DEFAULT 'unidades',
  price REAL NOT NULL,
  category TEXT NOT NULL DEFAULT 'Otros',
  low_stock_threshold REAL NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Stock movements (movimientos de stock)
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_change REAL NOT NULL,
  reason stock_movement_reason NOT NULL,
  reference_sale_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 Sales (ventas)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Otros',
  amount REAL NOT NULL,
  qty REAL NOT NULL DEFAULT 1,
  method payment_method NOT NULL DEFAULT 'Efectivo',
  location sale_location NOT NULL DEFAULT 'Tienda',
  date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 Locker locations (ubicaciones de casilleros)
CREATE TABLE casillero_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name casillero_location_name NOT NULL UNIQUE,
  display_name TEXT NOT NULL
);

-- 2.6 Locker slots (casilleros individuales)
CREATE TABLE casillero_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES casillero_locations(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 12),
  size casillero_size NOT NULL,
  status slot_status NOT NULL DEFAULT 'disponible',
  UNIQUE(location_id, slot_number)
);

-- 2.7 Locker reservations (reservas de casilleros)
CREATE TABLE casillero_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES casillero_slots(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  location casillero_location_name NOT NULL,
  casillero_number INTEGER NOT NULL,
  size casillero_size NOT NULL,
  access_pin TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status reservation_status NOT NULL DEFAULT 'activo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES
-- ============================================

CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_stock_movements_business ON stock_movements(business_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_sales_business ON sales(business_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_casillero_reservations_business ON casillero_reservations(business_id);
CREATE INDEX idx_casillero_slots_location ON casillero_slots(location_id);

-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE casillero_reservations ENABLE ROW LEVEL SECURITY;

-- Businesses: each user can only see/manage their own business
CREATE POLICY "businesses_owner_policy" ON businesses
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Products: access through business ownership
CREATE POLICY "products_business_policy" ON products
  FOR ALL
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Stock movements: access through business ownership
CREATE POLICY "stock_movements_business_policy" ON stock_movements
  FOR ALL
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Sales: access through business ownership
CREATE POLICY "sales_business_policy" ON sales
  FOR ALL
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Locker reservations: access through business ownership
CREATE POLICY "casillero_reservations_business_policy" ON casillero_reservations
  FOR ALL
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Locker locations and slots are public read-only
ALTER TABLE casillero_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE casillero_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "casillero_locations_read_policy" ON casillero_locations
  FOR SELECT
  USING (true);

CREATE POLICY "casillero_slots_read_policy" ON casillero_slots
  FOR SELECT
  USING (true);

-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create business on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO businesses (name, owner_id)
  VALUES (COALESCE(NEW.raw_user_meta_data ->> 'business_name', 'Mi Negocio'), NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 6. SEED DATA
-- ============================================

INSERT INTO casillero_locations (name, display_name) VALUES
  ('La Paz', 'La Paz'),
  ('Cochabamba', 'Cochabamba');

DO $$
DECLARE
  loc_id UUID;
BEGIN
  FOR loc_id IN (SELECT id FROM casillero_locations) LOOP
    INSERT INTO casillero_slots (location_id, slot_number, size) VALUES
      (loc_id, 1, 'PEQUEÑO'),  (loc_id, 2, 'PEQUEÑO'),
      (loc_id, 3, 'PEQUEÑO'),  (loc_id, 4, 'PEQUEÑO'),
      (loc_id, 5, 'MEDIANO'),  (loc_id, 6, 'MEDIANO'),
      (loc_id, 7, 'MEDIANO'),  (loc_id, 8, 'MEDIANO'),
      (loc_id, 9, 'GRANDE'),   (loc_id, 10, 'GRANDE'),
      (loc_id, 11, 'GRANDE'),  (loc_id, 12, 'GRANDE');
  END LOOP;
END;
$$;
