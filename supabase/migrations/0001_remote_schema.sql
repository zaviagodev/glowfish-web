

SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = on;

SELECT pg_catalog.set_config('search_path', '', false);

SET check_function_bodies = false;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = off;



CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";







COMMENT ON SCHEMA "public" IS 'standard public schema';




CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";







CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";







CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";







CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";







CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";







CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";







CREATE OR REPLACE FUNCTION "public"."create_order"("p_store_name" "text", "p_customer_id" "uuid", "p_status" "text", "p_subtotal" numeric, "p_discount" numeric, "p_shipping" numeric, "p_tax" numeric, "p_total" numeric, "p_notes" "text", "p_tags" "text"[], "p_items" "jsonb") RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_order_id uuid;

  v_item jsonb;

  v_product_quantity integer;

begin
  -- Create the order
  insert into orders (
    store_name,
    customer_id,
    status,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    notes,
    tags
  ) values (
    p_store_name,
    p_customer_id,
    p_status,
    p_subtotal,
    p_discount,
    p_shipping,
    p_tax,
    p_total,
    p_notes,
    p_tags
  ) returning orders.id into v_order_id;


  -- Process each order item
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    -- Check product quantity
    select products.quantity into v_product_quantity
    from products
    where products.id = (v_item->>'product_id')::uuid
    and products.store_name = p_store_name
    and products.track_quantity = true
    for update;


    if v_product_quantity is not null then
      if v_product_quantity < (v_item->>'quantity')::integer then
        raise exception 'Insufficient stock for product %', (v_item->>'product_id')::uuid;

      end if;


      -- Update product quantity
      update products
      set 
        quantity = quantity - (v_item->>'quantity')::integer,
        updated_at = now()
      where products.id = (v_item->>'product_id')::uuid
      and products.store_name = p_store_name;

    end if;


    -- Create order item
    insert into order_items (
      order_id,
      product_id,
      quantity,
      price,
      total
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::decimal,
      (v_item->>'total')::decimal
    );

  end loop;


  -- Return the created order details
  return query
  select 
    orders.id,
    orders.created_at,
    orders.updated_at
  from orders
  where orders.id = v_order_id;

end;

$$;



ALTER FUNCTION "public"."create_order"("p_store_name" "text", "p_customer_id" "uuid", "p_status" "text", "p_subtotal" numeric, "p_discount" numeric, "p_shipping" numeric, "p_tax" numeric, "p_total" numeric, "p_notes" "text", "p_tags" "text"[], "p_items" "jsonb") OWNER TO "postgres";



CREATE OR REPLACE FUNCTION "public"."place_order"("p_store_name" "text", "p_customer_id" "uuid", "p_status" "text", "p_subtotal" numeric, "p_discount" numeric, "p_shipping" numeric, "p_tax" numeric, "p_total" numeric, "p_notes" "text", "p_tags" "text"[], "p_items" "jsonb") RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_order_id uuid;

  v_item jsonb;

  v_product record;

begin
  -- Start transaction
  begin
    -- Create the order
    insert into orders (
      store_name,
      customer_id,
      status,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      notes,
      tags
    ) values (
      p_store_name,
      p_customer_id,
      p_status,
      p_subtotal,
      p_discount,
      p_shipping,
      p_tax,
      p_total,
      p_notes,
      p_tags
    ) returning id into v_order_id;


    -- Process each order item
    for v_item in select * from jsonb_array_elements(p_items)
    loop
      -- Lock and validate product
      select *
      into v_product
      from products
      where id = (v_item->>'product_id')::uuid
        and store_name = p_store_name
        and status = 'active'
      for update;


      if v_product is null then
        raise exception 'Product % not found or is not active', (v_item->>'product_id')::uuid;

      end if;


      -- Check stock if tracking is enabled
      if v_product.track_quantity then
        if v_product.quantity < (v_item->>'quantity')::integer then
          raise exception 'Insufficient stock for product %: % available, % requested',
            v_product.name, v_product.quantity, (v_item->>'quantity')::integer;

        end if;


        -- Update product stock
        update products
        set 
          quantity = quantity - (v_item->>'quantity')::integer,
          updated_at = now()
        where id = v_product.id;

      end if;


      -- Create order item
      insert into order_items (
        order_id,
        product_id,
        quantity,
        price,
        total
      ) values (
        v_order_id,
        v_product.id,
        (v_item->>'quantity')::integer,
        (v_item->>'price')::decimal,
        (v_item->>'total')::decimal
      );

    end loop;


    -- Return the created order details
    return query
    select orders.id, orders.created_at, orders.updated_at
    from orders
    where orders.id = v_order_id;


    -- Commit transaction
    commit;

  exception
    when others then
      -- Rollback transaction on any error
      rollback;

      raise;

  end;

end;

$$;



ALTER FUNCTION "public"."place_order"("p_store_name" "text", "p_customer_id" "uuid", "p_status" "text", "p_subtotal" numeric, "p_discount" numeric, "p_shipping" numeric, "p_tax" numeric, "p_total" numeric, "p_notes" "text", "p_tags" "text"[], "p_items" "jsonb") OWNER TO "postgres";



CREATE OR REPLACE FUNCTION "public"."update_product_stock"("p_product_id" "uuid", "p_quantity" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  update products
  set 
    quantity = quantity - p_quantity,
    updated_at = now()
  where 
    id = p_product_id
    and track_quantity = true
    and quantity >= p_quantity;

    
  if not found then
    raise exception 'Failed to update product stock';

  end if;

end;

$$;



ALTER FUNCTION "public"."update_product_stock"("p_product_id" "uuid", "p_quantity" integer) OWNER TO "postgres";


SET default_tablespace = '';


SET default_table_access_method = "heap";



CREATE TABLE IF NOT EXISTS "public"."customer_addresses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "store_name" "text",
    "type" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "company" "text",
    "address1" "text" NOT NULL,
    "address2" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "postal_code" "text" NOT NULL,
    "country" "text" NOT NULL,
    "phone" "text",
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "customer_addresses_type_check" CHECK (("type" = ANY (ARRAY['billing'::"text", 'shipping'::"text"])))
);



ALTER TABLE "public"."customer_addresses" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "store_name" "text",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "accepts_marketing" boolean DEFAULT false,
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);



ALTER TABLE "public"."customers" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "product_id" "uuid",
    "quantity" integer NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "total" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);



ALTER TABLE "public"."order_items" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "store_name" "text",
    "customer_id" "uuid",
    "status" "text" NOT NULL,
    "subtotal" numeric(10,2) NOT NULL,
    "discount" numeric(10,2) DEFAULT 0,
    "shipping" numeric(10,2) DEFAULT 0,
    "tax" numeric(10,2) DEFAULT 0,
    "total" numeric(10,2) NOT NULL,
    "notes" "text",
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'shipped'::"text", 'delivered'::"text", 'cancelled'::"text"])))
);



ALTER TABLE "public"."orders" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "url" "text" NOT NULL,
    "alt" "text",
    "position" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);



ALTER TABLE "public"."product_images" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."product_tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);



ALTER TABLE "public"."product_tags" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "store_name" "text",
    "name" "text" NOT NULL,
    "description" "text",
    "category_id" "text",
    "category_name" "text",
    "price" numeric(10,2) NOT NULL,
    "compare_at_price" numeric(10,2),
    "cost" numeric(10,2),
    "sku" "text",
    "barcode" "text",
    "track_quantity" boolean DEFAULT false,
    "quantity" integer,
    "weight" numeric(10,2) NOT NULL,
    "weight_unit" "text" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "products_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'archived'::"text"]))),
    CONSTRAINT "products_weight_unit_check" CHECK (("weight_unit" = ANY (ARRAY['kg'::"text", 'lb'::"text"])))
);



ALTER TABLE "public"."products" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "store_name" "text" NOT NULL,
    "avatar_url" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);



ALTER TABLE "public"."profiles" OWNER TO "postgres";



ALTER TABLE ONLY "public"."customer_addresses"
    ADD CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id");




ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");




ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_store_name_email_key" UNIQUE ("store_name", "email");




ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");




ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");




ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");




ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_pkey" PRIMARY KEY ("id");




ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");




ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");




ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");




ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_store_name_key" UNIQUE ("store_name");




CREATE INDEX "customer_addresses_customer_id_idx" ON "public"."customer_addresses" USING "btree" ("customer_id");




CREATE INDEX "customers_email_idx" ON "public"."customers" USING "btree" ("email");




CREATE INDEX "customers_store_name_idx" ON "public"."customers" USING "btree" ("store_name");




CREATE INDEX "order_items_order_id_idx" ON "public"."order_items" USING "btree" ("order_id");




CREATE INDEX "order_items_product_id_idx" ON "public"."order_items" USING "btree" ("product_id");




CREATE INDEX "orders_customer_id_idx" ON "public"."orders" USING "btree" ("customer_id");




CREATE INDEX "orders_status_idx" ON "public"."orders" USING "btree" ("status");




CREATE INDEX "orders_store_name_idx" ON "public"."orders" USING "btree" ("store_name");




CREATE INDEX "product_images_product_id_idx" ON "public"."product_images" USING "btree" ("product_id");




CREATE INDEX "product_tags_product_id_idx" ON "public"."product_tags" USING "btree" ("product_id");




CREATE INDEX "products_status_idx" ON "public"."products" USING "btree" ("status");




CREATE INDEX "products_store_name_idx" ON "public"."products" USING "btree" ("store_name");




CREATE INDEX "profiles_email_idx" ON "public"."profiles" USING "btree" ("email");




CREATE INDEX "profiles_store_name_idx" ON "public"."profiles" USING "btree" ("store_name");




ALTER TABLE ONLY "public"."customer_addresses"
    ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;




ALTER TABLE ONLY "public"."customer_addresses"
    ADD CONSTRAINT "customer_addresses_store_name_fkey" FOREIGN KEY ("store_name") REFERENCES "public"."profiles"("store_name") ON DELETE CASCADE;




ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_store_name_fkey" FOREIGN KEY ("store_name") REFERENCES "public"."profiles"("store_name") ON DELETE CASCADE;




ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;




ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;




ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;




ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_store_name_fkey" FOREIGN KEY ("store_name") REFERENCES "public"."profiles"("store_name") ON DELETE CASCADE;




ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;




ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;




ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_store_name_fkey" FOREIGN KEY ("store_name") REFERENCES "public"."profiles"("store_name") ON DELETE CASCADE;




ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;




CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));




CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);




CREATE POLICY "Enable update for users based on id" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));




CREATE POLICY "Public users can create customer addresses" ON "public"."customer_addresses" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."customers"
  WHERE (("customers"."id" = "customer_addresses"."customer_id") AND ("customers"."store_name" = "customer_addresses"."store_name")))));




CREATE POLICY "Public users can create customers" ON "public"."customers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE ("profiles"."store_name" = "customers"."store_name"))));




CREATE POLICY "Public users can create order items" ON "public"."order_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE ("orders"."id" = "order_items"."order_id"))));




CREATE POLICY "Public users can create orders" ON "public"."orders" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE ("profiles"."store_name" = "orders"."store_name"))));




CREATE POLICY "Public users can view active products" ON "public"."products" FOR SELECT USING ((("status" = 'active'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE ("profiles"."store_name" = "products"."store_name")))));




CREATE POLICY "Public users can view product images" ON "public"."product_images" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."products"
  WHERE (("products"."id" = "product_images"."product_id") AND ("products"."status" = 'active'::"text")))));




CREATE POLICY "Public users can view product tags" ON "public"."product_tags" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."products"
  WHERE (("products"."id" = "product_tags"."product_id") AND ("products"."status" = 'active'::"text")))));




CREATE POLICY "Users can delete their store's customer addresses" ON "public"."customer_addresses" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."customers"
  WHERE (("customers"."id" = "customer_addresses"."customer_id") AND ("customers"."store_name" = "customer_addresses"."store_name") AND (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."store_name" = "customers"."store_name") AND ("profiles"."id" = "auth"."uid"()))))))));




CREATE POLICY "Users can delete their store's customers" ON "public"."customers" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "customers"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can delete their store's orders" ON "public"."orders" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "orders"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can delete their store's products" ON "public"."products" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "products"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can insert addresses to their store's customers" ON "public"."customer_addresses" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."customers"
  WHERE (("customers"."id" = "customer_addresses"."customer_id") AND ("customers"."store_name" = "customer_addresses"."store_name") AND (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."store_name" = "customers"."store_name") AND ("profiles"."id" = "auth"."uid"()))))))));




CREATE POLICY "Users can insert customers to their store" ON "public"."customers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "customers"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can insert orders to their store" ON "public"."orders" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "orders"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can insert products to their store" ON "public"."products" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "products"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can manage their store's order items" ON "public"."order_items" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."store_name" = "orders"."store_name") AND ("profiles"."id" = "auth"."uid"()))))))));




CREATE POLICY "Users can manage their store's product images" ON "public"."product_images" USING ((EXISTS ( SELECT 1
   FROM "public"."products"
  WHERE (("products"."id" = "product_images"."product_id") AND (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."store_name" = "products"."store_name") AND ("profiles"."id" = "auth"."uid"()))))))));




CREATE POLICY "Users can manage their store's product tags" ON "public"."product_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."products"
  WHERE (("products"."id" = "product_tags"."product_id") AND (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."store_name" = "products"."store_name") AND ("profiles"."id" = "auth"."uid"()))))))));




CREATE POLICY "Users can update their store's customer addresses" ON "public"."customer_addresses" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."customers"
  WHERE (("customers"."id" = "customer_addresses"."customer_id") AND ("customers"."store_name" = "customer_addresses"."store_name") AND (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."store_name" = "customers"."store_name") AND ("profiles"."id" = "auth"."uid"()))))))));




CREATE POLICY "Users can update their store's customers" ON "public"."customers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "customers"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can update their store's orders" ON "public"."orders" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "orders"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can update their store's products" ON "public"."products" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "products"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can view their store's customer addresses" ON "public"."customer_addresses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."customers"
  WHERE (("customers"."id" = "customer_addresses"."customer_id") AND ("customers"."store_name" = "customer_addresses"."store_name") AND (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."store_name" = "customers"."store_name") AND ("profiles"."id" = "auth"."uid"()))))))));




CREATE POLICY "Users can view their store's customers" ON "public"."customers" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "customers"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can view their store's orders" ON "public"."orders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "orders"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




CREATE POLICY "Users can view their store's products" ON "public"."products" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."store_name" = "products"."store_name") AND ("profiles"."id" = "auth"."uid"())))));




ALTER TABLE "public"."customer_addresses" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."product_tags" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";




GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";





















































































































































































GRANT ALL ON FUNCTION "public"."create_order"("p_store_name" "text", "p_customer_id" "uuid", "p_status" "text", "p_subtotal" numeric, "p_discount" numeric, "p_shipping" numeric, "p_tax" numeric, "p_total" numeric, "p_notes" "text", "p_tags" "text"[], "p_items" "jsonb") TO "anon";

GRANT ALL ON FUNCTION "public"."create_order"("p_store_name" "text", "p_customer_id" "uuid", "p_status" "text", "p_subtotal" numeric, "p_discount" numeric, "p_shipping" numeric, "p_tax" numeric, "p_total" numeric, "p_notes" "text", "p_tags" "text"[], "p_items" "jsonb") TO "authenticated";

GRANT ALL ON FUNCTION "public"."create_order"("p_store_name" "text", "p_customer_id" "uuid", "p_status" "text", "p_subtotal" numeric, "p_discount" numeric, "p_shipping" numeric, "p_tax" numeric, "p_total" numeric, "p_notes" "text", "p_tags" "text"[], "p_items" "jsonb") TO "service_role";




GRANT ALL ON FUNCTION "public"."place_order"("p_store_name" "text", "p_customer_id" "uuid", "p_status" "text", "p_subtotal" numeric, "p_discount" numeric, "p_shipping" numeric, "p_tax" numeric, "p_total" numeric, "p_notes" "text", "p_tags" "text"[], "p_items" "jsonb") TO "anon";

GRANT ALL ON FUNCTION "public"."place_order"("p_store_name" "text", "p_customer_id" "uuid", "p_status" "text", "p_subtotal" numeric, "p_discount" numeric, "p_shipping" numeric, "p_tax" numeric, "p_total" numeric, "p_notes" "text", "p_tags" "text"[], "p_items" "jsonb") TO "authenticated";

GRANT ALL ON FUNCTION "public"."place_order"("p_store_name" "text", "p_customer_id" "uuid", "p_status" "text", "p_subtotal" numeric, "p_discount" numeric, "p_shipping" numeric, "p_tax" numeric, "p_total" numeric, "p_notes" "text", "p_tags" "text"[], "p_items" "jsonb") TO "service_role";




GRANT ALL ON FUNCTION "public"."update_product_stock"("p_product_id" "uuid", "p_quantity" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."update_product_stock"("p_product_id" "uuid", "p_quantity" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_product_stock"("p_product_id" "uuid", "p_quantity" integer) TO "service_role";



















GRANT ALL ON TABLE "public"."customer_addresses" TO "anon";

GRANT ALL ON TABLE "public"."customer_addresses" TO "authenticated";

GRANT ALL ON TABLE "public"."customer_addresses" TO "service_role";




GRANT ALL ON TABLE "public"."customers" TO "anon";

GRANT ALL ON TABLE "public"."customers" TO "authenticated";

GRANT ALL ON TABLE "public"."customers" TO "service_role";




GRANT ALL ON TABLE "public"."order_items" TO "anon";

GRANT ALL ON TABLE "public"."order_items" TO "authenticated";

GRANT ALL ON TABLE "public"."order_items" TO "service_role";




GRANT ALL ON TABLE "public"."orders" TO "anon";

GRANT ALL ON TABLE "public"."orders" TO "authenticated";

GRANT ALL ON TABLE "public"."orders" TO "service_role";




GRANT ALL ON TABLE "public"."product_images" TO "anon";

GRANT ALL ON TABLE "public"."product_images" TO "authenticated";

GRANT ALL ON TABLE "public"."product_images" TO "service_role";




GRANT ALL ON TABLE "public"."product_tags" TO "anon";

GRANT ALL ON TABLE "public"."product_tags" TO "authenticated";

GRANT ALL ON TABLE "public"."product_tags" TO "service_role";




GRANT ALL ON TABLE "public"."products" TO "anon";

GRANT ALL ON TABLE "public"."products" TO "authenticated";

GRANT ALL ON TABLE "public"."products" TO "service_role";




GRANT ALL ON TABLE "public"."profiles" TO "anon";

GRANT ALL ON TABLE "public"."profiles" TO "authenticated";

GRANT ALL ON TABLE "public"."profiles" TO "service_role";




ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";







ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";







ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";































RESET ALL;

;
