import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Content-Length': '0',
        'Content-Type': 'text/plain'
      }
    })
  }

  try {
    const { code, redirectUri } = await req.json()
    
    // Get LINE credentials from environment variables
    const clientId = Deno.env.get('VITE_LINE_CLIENT_ID')
    const clientSecret = Deno.env.get('VITE_LINE_CLIENT_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!clientId || !clientSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required credentials')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to get access token')
    }

    // Get user profile from Line
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    if (!profileResponse.ok) {
      throw new Error('Failed to get Line profile')
    }

    const profileData = await profileResponse.json()

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user exists in oauth_provider_ids
    const { data: existingOAuth, error: oauthError } = await supabase
      .from('oauth_provider_ids')
      .select('user_id')
      .eq('provider', 'line')
      .eq('provider_user_id', profileData.userId)
      .single();

    if (oauthError && oauthError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw oauthError;
    }

    if (existingOAuth?.user_id) {
      // Get existing customer data
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*, auth_id')
        .eq('auth_id', existingOAuth.user_id)
        .single();

      if (customerError) throw customerError;

      // Generate magic link for existing user
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: customer.email
      });

      if (linkError) throw linkError;

      // Verify email
      const verifyUrl = `${supabaseUrl}/auth/v1/verify`;
      const verifyResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Authorization': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customer.email,
          token: linkData.properties.email_otp,
          type: 'email'
        }),
      });

      const verifyResult = await verifyResponse.json();

      return new Response(
        JSON.stringify({
          ...tokenData,
          type: 1,
          access_token: verifyResult.access_token,
          refresh_token: verifyResult.refresh_token,
          user: verifyResult.user,
          customer: customer,
          redirect: 'home',
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // If no existing user, return data for registration
    return new Response(
      JSON.stringify({
        ...tokenData,
        type: 0,
        line_id: profileData.userId,
        profile: profileData,
        redirect: 'register',
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
});