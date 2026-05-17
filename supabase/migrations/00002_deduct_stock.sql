-- Deduct stock atomically: update product + insert movement in one transaction
CREATE OR REPLACE FUNCTION deduct_stock(
  p_product_id UUID,
  p_quantity REAL,
  p_reference_sale_id UUID DEFAULT NULL
)
RETURNS REAL
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_business_id UUID;
  v_new_current REAL;
BEGIN
  -- Get the business_id for RLS check
  SELECT business_id INTO v_business_id
  FROM products
  WHERE id = p_product_id;

  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Verify the user owns this business
  IF NOT EXISTS (
    SELECT 1 FROM businesses
    WHERE id = v_business_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Update stock (prevent negative)
  UPDATE products
  SET stock_current = GREATEST(0, stock_current - p_quantity)
  WHERE id = p_product_id
  RETURNING stock_current INTO v_new_current;

  -- Record the movement
  INSERT INTO stock_movements (
    business_id, product_id, quantity_change,
    reason, reference_sale_id
  ) VALUES (
    v_business_id, p_product_id, -p_quantity,
    'venta', p_reference_sale_id
  );

  RETURN v_new_current;
END;
$$;
