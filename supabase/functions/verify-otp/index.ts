import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Standard error response structure
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Helper function to create standardized error responses
const createErrorResponse = (code: string, message: string, details?: any): ErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    ...(details && { details })
  }
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { otp, phone, line_id, access_token, token } = await req.json()
    
    // Verify OTP
    const apiUrl = Deno.env.get('SMS2PRO_URL') + '/verify';
    const apiToken = Deno.env.get('SMS2PRO_API');

    if (!apiUrl || !apiToken) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'CONFIG_ERROR',
          'Missing SMS service configuration'
        )),
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const verifyResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        otp_code: otp,
      }),
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult?.data?.is_valid) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'INVALID_OTP',
          'Invalid OTP code provided'
        )),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Get Line profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })

    if (!profileResponse.ok) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'LINE_PROFILE_ERROR',
          'Failed to get Line profile',
          { status: profileResponse.status }
        )),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const profileData = await profileResponse.json()

    // Get email from Line
    let email = `${profileData.id}@line.com`
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'SUPABASE_CONFIG_ERROR',
          'Missing Supabase configuration'
        )),
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Create or update user
    const { data: { user }, error: createUserError } = await adminClient.auth.admin.createUser({
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

    if (createUserError) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'USER_CREATE_ERROR',
          'Failed to create user',
          { details: createUserError }
        )),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Create customer record
    const [firstName, ...lastNameParts] = profileData.displayName.split(' ');
    const lastName = lastNameParts.join(' ');

    const { error: customerError } = await adminClient
      .from('customers')
      .upsert({
        id: user.id, // Use the same ID as auth user
        store_name: 'glowfish', // Replace with actual store name
        first_name: firstName,
        last_name: lastName || firstName, // Use firstName as lastName if no lastName provided
        email: email,
        phone: phone,
        accepts_marketing: true,
        tags: ['line'], // Add relevant tags
        is_verified: true,
        auth_id: user.id
      }, {
        onConflict: 'id'
      });

    if (customerError) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'CUSTOMER_CREATE_ERROR',
          'Failed to create customer record',
          { details: customerError }
        )),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Generate magic link
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: email
    })

    if (linkError) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'MAGIC_LINK_ERROR',
          'Failed to generate magic link',
          { details: linkError }
        )),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const email_otp = linkData.properties.email_otp

    // Verify email OTP
    const verifyUrl = `${supabaseUrl}/auth/v1/verify`
    const verifyEmailResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        token: email_otp,
        type: 'email'
      }),
    })

    const verifyEmailResult = await verifyEmailResponse.json()
    if (!verifyEmailResult.access_token) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'EMAIL_VERIFY_ERROR',
          'Failed to verify email'
        )),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        type: 1,
        access_token: verifyEmailResult.access_token,
        refresh_token: verifyEmailResult.refresh_token,
        user: verifyEmailResult.user,
        profile: profileData
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    // Handle unexpected errors
    return new Response(
      JSON.stringify(createErrorResponse(
        'INTERNAL_ERROR',
        'An unexpected error occurred',
        { message: error.message }
      )),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})