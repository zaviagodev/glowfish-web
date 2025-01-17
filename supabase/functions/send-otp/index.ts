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

  const { phone,line_id } = await req.json()
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }
  // // Initialize admin client
  // const supabase = createClient(supabaseUrl, supabaseServiceKey)


  // // Check rate limit
  // const { data: lastRequest, error } = await supabase
  //   .from('otp_requests')
  //   .select('last_request')
  //   .eq('ip_address', ip)
  //   .order('last_request', { ascending: false })
  //   .limit(1)
  //   .single();  



  // const now = new Date();
  // const limitMinutes = 5;

  // if (lastRequest && new Date(lastRequest.last_request) > new Date(now.getTime() - limitMinutes * 60000)) {
  //   return new Response(
  //     JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
  //     { status: 429, headers: { 'Content-Type': 'application/json' } }
  //   );
  // }

  // // Record the current request time
  // await supabase
  //   .from('otp_requests')
  //   .insert({ ip_address: ip, last_request: now.toISOString() });

  // Proceed with sending the OTP
  const apiUrl =  'https://portal.sms2pro.com/sms-api/otp-sms/send';
  const apiToken = Deno.env.get('SMS2PRO_API'); // Use your actual token

  const payload = {
    recipient: phone,
    sender_name: 'ZAVIAGO',
    digit : 6
  };

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

  return new Response(
    JSON.stringify({ 
      success: true,
      token : token,
    }),
    { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )


  // try {
  //   const { otp, phone, line_id, access_token } = await req.json()

  //   // Validate OTP
  //   if (otp !== "111111") {
  //     throw new Error('Invalid OTP')
  //   }

  //   // Get Line profile
  //   const profileResponse = await fetch('https://api.line.me/v2/profile', {
  //     headers: {
  //       'Authorization': `Bearer ${access_token}`
  //     }
  //   })

  //   if (!profileResponse.ok) {
  //     throw new Error('Failed to get Line profile')
  //   }

  //   const profileData = await profileResponse.json()

  //   // Get email from Line
  //   let email = `${line_id}@line.com` // Default email
  //   try {
  //     const emailResponse = await fetch('https://api.line.me/v2/profile/email', {
  //       headers: {
  //         'Authorization': `Bearer ${access_token}`
  //       }
  //     })
  //     if (emailResponse.ok) {
  //       const emailData = await emailResponse.json()
  //       if (emailData.email) {
  //         email = emailData.email
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Failed to get Line email:', error)
  //     // Continue with default email
  //   }
  //   const supabaseUrl = Deno.env.get('SUPABASE_URL')
  //   const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  //   const supabaseAnonKey = Deno.env.get('VITE_SUPABASE_ANON_KEY')
  //   if (!supabaseUrl || !supabaseServiceKey) {
  //     throw new Error('Missing Supabase credentials')
  //   }
  //   // Initialize admin client
  //   const adminClient = createClient(supabaseUrl, supabaseServiceKey)
  //   const customerClient = createClient(supabaseUrl, supabaseAnonKey);


  //   // Create or update user with phone auth
  //   const { data: { user }, error: phoneAuthError } = await adminClient.auth.admin.createUser({
  //     phone,
  //     email,
  //     user_metadata: {
  //       line_id,
  //       avatar_url: profileData.pictureUrl,
  //       full_name: profileData.displayName,
  //       email
  //     },
  //     email_confirm: true,
  //     phone_confirm: true
  //   })
  //   if (phoneAuthError) throw phoneAuthError

  //   const { data, error } = await adminClient.auth.admin.generateLink({
  //     type: 'magiclink',
  //     email: email
  //   })
  //   const email_otp = data.properties.email_otp;
  //   // // Verify OTP and get session
  //   // const { data : { session_data }, session_error } = await customerClient.auth.verifyOtp({
  //   //   email,
  //   //   token: email_otp,
  //   //   type: 'email'
  //   // })
  //   // if (session_error) throw session_error
  //   return new Response(
  //     JSON.stringify({ 
  //       success: true,
  //       email : email,
  //       token : email_otp,
  //     }),
  //     { 
  //       headers: {
  //         ...corsHeaders,
  //         'Content-Type': 'application/json'
  //       }
  //     }
  //   )

  // } catch (error) {
  //   return new Response(
  //     JSON.stringify({ error: error.message }),
  //     { 
  //       status: 400,
  //       headers: {
  //         ...corsHeaders,
  //         'Content-Type': 'application/json'
  //       }
  //     }
  //   )
  // }
})