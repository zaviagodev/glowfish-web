import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const formData = await req.formData();
    const orderId = formData.get("orderId") as string;
    const storeName = formData.get("storeName") as string;
    const paymentType = formData.get("paymentType") as
      | "bank_transfer"
      | "promptpay";
    const bankName = formData.get("bankName") as string;
    const transferReference = formData.get("transferReference") as string;
    const slipFile = formData.get("slipFile") as File;

    // Validate required fields
    if (!orderId || !storeName || !paymentType || !slipFile) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify the order exists and belongs to the store
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .eq("store_name", storeName)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({
          error: "Order not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify order status is pending
    if (order.status !== "pending") {
      return new Response(
        JSON.stringify({
          error: "Order is not in pending status",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Upload the slip file
    const fileExt = slipFile.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${storeName}/slips/orders/${orderId}/${fileName}`;

    // Delete existing slip if any
    const { data: existingFiles } = await supabase.storage
      .from(Deno.env.get("STORAGE_BUCKET")!)
      .list(`${storeName}/slips/orders/${orderId}`);

    if (existingFiles && existingFiles.length > 0) {
      await supabase.storage
        .from(Deno.env.get("STORAGE_BUCKET")!)
        .remove(
          existingFiles.map(
            (file) => `${storeName}/slips/orders/${orderId}/${file.name}`
          )
        );
    }

    // Upload new slip
    const { error: uploadError } = await supabase.storage
      .from(Deno.env.get("STORAGE_BUCKET")!)
      .upload(filePath, slipFile, {
        upsert: true,
        contentType: slipFile.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(Deno.env.get("STORAGE_BUCKET")!)
      .getPublicUrl(filePath);

    // Update order payment details
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_details: {
          type: paymentType,
          bank_name: bankName,
          qr_code: paymentType === "promptpay" ? publicUrl : null,
          slip_image: publicUrl,
          uploaded_at: new Date().toISOString(),
          transfer_reference: transferReference,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("store_name", storeName);

    if (updateError) {
      throw updateError;
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment slip uploaded successfully",
        data: {
          slip_url: publicUrl,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing payment slip upload:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process payment slip upload",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}); 