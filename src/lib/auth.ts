import { supabase } from './supabase';

interface VerifyOTPResponse {
  success: boolean;
  error?: string;
  email?: string;
  token?: string;
}

interface LineAuthResponse {
  success: boolean;
  error?: string;
  redirect?: string;
  profile?: any;
  access_token?: string;
}

export const verifyOTP = async (
  otp: string,
  phone: string,
  verification_token: string,
): Promise<VerifyOTPResponse> => {
  try {
    const token = localStorage.getItem("refine-auth");
    const lineUser = JSON.parse(localStorage.getItem("line-user") || "{}");

    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: {
        otp,
        phone,
        token : verification_token,
        line_id: lineUser.userId,
        access_token: token,
      },
    });

    if (error) throw error;

    return {
      success: true,
      email: data.email,
      token: data.token
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      error: 'Failed to verify OTP'
    };
  }
}

export const handleLineAuth = async (code: string, redirectUri: string): Promise<LineAuthResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('line-auth', {
      body: {
        code,
        redirectUri
      }
    });

    if (error) throw error;

    // Store tokens and user data
    localStorage.setItem("refine-auth", data.access_token);
    localStorage.setItem("line-user", JSON.stringify(data.profile));

    return {
      success: true,
      redirect: data.redirect,
      profile: data.profile,
      access_token: data.access_token
    };

  } catch (error) {
    console.error('Line authentication error:', error);
    return {
      success: false,
      error: 'Failed to authenticate with Line'
    };
  }
}

export const setSupabaseSession = async (email: string, token: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;

    if (data?.session) {
      // Set session in Supabase client
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) throw sessionError;
      return true;
    }

    return false;
  } catch (error) {
    console.error('Session setup error:', error);
    return false;
  }
}