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

  let createdUser = null;
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    const { otp, phone, token, line_id, access_token, store_name } = await req.json()

    // Use store_name from request if provided, otherwise use env variable
    const effectiveStore = store_name || Deno.env.get('VITE_DEFAULT_STORE');

    // Verify OTP
    const apiUrl = 'https://portal.sms2pro.com/sms-api/otp-sms/verify';
    const apiToken = Deno.env.get('SMS2PRO_API');

    if (!apiUrl || !apiToken) {
      throw new Error('Missing SMS service configuration');
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
      throw new Error('Invalid OTP code');
    }

    // Get Line profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to get Line profile');
    }

    const profileData = await profileResponse.json();

    // Get email from Line
    let email = `${profileData.userId}@line.com`;
    try {
      const emailResponse = await fetch('https://api.line.me/v2/profile/email', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        if (emailData.email) {
          email = emailData.email;
        }
      }
    } catch (error) {
      console.error('Failed to get Line email:', error);
      // Continue with default email
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

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
    });

    if (createUserError) {
      throw createUserError;
    }

    // Store the created user for potential cleanup
    createdUser = user;

    // Create customer record
    const [firstName, ...lastNameParts] = profileData.displayName.split(' ');
    const lastName = lastNameParts.join(' ');

    const { data: customerData, error: customerError } = await adminClient
      .from('customers')
      .upsert({
        id: user.id,
        store_name: effectiveStore,
        first_name: firstName,
        last_name: lastName || firstName,
        email: email,
        phone: phone,
        accepts_marketing: true,
        avatar_url: profileData.pictureUrl,
        tags: ['line'],
        is_verified: true,
        auth_id: user.id
      }, {
        onConflict: 'id'
      });

    if (customerError) {
      throw customerError;
    }

    // Create OAuth provider entry
    const { error: oauthError } = await adminClient
      .from('oauth_provider_ids')
      .upsert({
        provider: 'line',
        user_id: user.id,
        store_name: effectiveStore
      });

    if (oauthError) throw oauthError;

    // Generate magic link
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: email
    });

    if (linkError) {
      throw linkError;
    }

    const email_otp = linkData.properties.email_otp;

    // Verify email OTP
    const verifyUrl = `${supabaseUrl}/auth/v1/verify`;
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
    });

    const verifyEmailResult = await verifyEmailResponse.json();
    if (!verifyEmailResult.access_token) {
      throw new Error('Failed to verify email');
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        type: 1,
        access_token: verifyEmailResult.access_token,
        refresh_token: verifyEmailResult.refresh_token,
        user: verifyEmailResult.user,
        profile: profileData,
        customer: customerData
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    // If we created a user but subsequent operations failed, delete the user
    if (createdUser) {
      try {
        await adminClient.auth.admin.deleteUser(createdUser.id);
      } catch (deleteError) {
        console.error('Failed to delete user after error:', deleteError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
