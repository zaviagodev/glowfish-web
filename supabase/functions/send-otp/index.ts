// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { phone,line_id, ref_code } = await req.json()
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }

  // Proceed with sending the OTP
  const apiUrl =  'https://portal.sms2pro.com/sms-api/otp-sms/send';
  const apiToken = Deno.env.get('SMS2PRO_API'); // Use your actual token

  const payload = {
    recipient: phone,
    sender_name: 'ZAVIAGO',
    digit : 6
  };

  if (ref_code) {
    Object.assign(payload, { ref_code });
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': apiToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  const token = result.data?.token;
  const response_ref_code = result.data?.ref_code;

  return new Response(
    JSON.stringify({ 
      success: true,
      token : token,
      ref_code : response_ref_code
    }),
    { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )
})