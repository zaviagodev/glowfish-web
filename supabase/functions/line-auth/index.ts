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

    // Check if user exists in profiles table
    const { data: existingAuthUser, error: authError } = await supabase.auth.admin.listUsers({
      filters: {
        user_metadata: {
          line_id: profileData.userId
        }
      }
    });
    if (authError) throw authError;
    const existingUser = existingAuthUser.users.length > 0;

    let user_info = [];
    if (existingUser) {
      user_info = existingAuthUser.users[0].user_metadata;
      let email = existingAuthUser.users[0].email;


      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email
      })
      const email_otp = data.properties.email_otp;

      
      const apiUrl = supabaseUrl+`/auth/v1/verify`;
      const payload = {
        email: email,
        token: email_otp,
        type: 'email'
      };
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      return new Response(
        JSON.stringify({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          user: result.user,
          type: 1,
          line_id: profileData.userId,
          redirect: 'home',
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      )

    }
    else{
      return new Response(
        JSON.stringify({
          ...tokenData,
          type: 0,
          line_id: profileData.userId,
          redirect: 'register',
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      )
    }

    

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
})