DROP FUNCTION public.place_order(
    p_store_name text,
    p_customer_id uuid,
    p_status text,
    p_subtotal numeric,
    p_shipping numeric,
    p_tax numeric,
    p_total numeric,
    p_notes text,
    p_tags text[],
    p_applied_coupons jsonb,
    p_loyalty_points_used numeric,
    p_shipping_address_id uuid,
    p_billing_address_id uuid,
    p_items jsonb
);