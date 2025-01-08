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

  try {
    const { otp, phone, line_id, access_token } = await req.json()

    // Validate OTP
    if (otp !== "111111") {
      throw new Error('Invalid OTP')
    }

    // Get Line profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })

    if (!profileResponse.ok) {
      throw new Error('Failed to get Line profile')
    }

    const profileData = await profileResponse.json()

    // Get email from Line
    let email = `${line_id}@line.com` // Default email
    try {
      const emailResponse = await fetch('https://api.line.me/v2/profile/email', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      if (emailResponse.ok) {
        const emailData = await emailResponse.json()
        if (emailData.email) {
          email = emailData.email
        }
      }
    } catch (error) {
      console.error('Failed to get Line email:', error)
      // Continue with default email
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('VITE_SUPABASE_ANON_KEY')
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }
    // Initialize admin client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    const customerClient = createClient(supabaseUrl, supabaseAnonKey);


    // Create or update user with phone auth
    const { data: { user }, error: phoneAuthError } = await adminClient.auth.admin.createUser({
      phone,
      email,
      user_metadata: {
        line_id,
        avatar_url: profileData.pictureUrl,
        full_name: profileData.displayName,
        email
      },
      email_confirm: true,
      phone_confirm: true
    })
    if (phoneAuthError) throw phoneAuthError

    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: email
    })
    const email_otp = data.properties.email_otp;
    // // Verify OTP and get session
    // const { data : { session_data }, session_error } = await customerClient.auth.verifyOtp({
    //   email,
    //   token: email_otp,
    //   type: 'email'
    // })
    // if (session_error) throw session_error
    return new Response(
      JSON.stringify({ 
        success: true,
        email : email,
        token : email_otp,
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})