import { supabase } from './supabase';
const USER_PROFILE_KEY = 'user_profile';

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

interface TokenData {
  access_token: string;
  refresh_token: string;
  user?: {
    id: string;
    email: string;
    user_metadata?:{
      full_name: string;
      avatar_url: string;
    }
  };
  email?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  phone?: string;
}


export const verifyOTP = async (
  otp: string,
  phone: string,
  verification_token: string,
): Promise<VerifyOTPResponse> => {
  try {
    const token = localStorage.getItem("refine-auth");
    const lineUser = JSON.parse(localStorage.getItem("line-user") || "{}");

    const { data : tokenData, error } = await supabase.functions.invoke('verify-otp', {
      body: {
        otp,
        phone,
        token : verification_token,
        line_id: lineUser.userId,
        access_token: token,
      },
    });

    if (error) throw error;

    const sessionSet = await setSupabaseSession(tokenData);
    if (!sessionSet) {
      throw new Error('Failed to set session');
    }
    return {
      success: true,
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


export const setSupabaseSession = async (tokenData: TokenData): Promise<boolean> => {
  const { access_token, refresh_token, user, email } = tokenData;

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionError) {
    console.error('Session Error:', sessionError);
    throw sessionError;
  }

  if (user) {
    const { id, email: userEmail, user_metadata } = user;
    if (user_metadata) {
      await setUserProfile({
        id: id,
        email: userEmail || email || '',
        full_name: user_metadata.full_name || '',
        avatar_url: user_metadata.avatar_url || '',
      });
    } else {
      console.warn('User metadata is undefined');
    }
  }
  return true;
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    // Try to get from localStorage first
    const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }
    // Return null if no profile found
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    // Return null if there is an error
    return null;
  }
}

export const setUserProfile = async (profile: UserProfile): Promise<boolean> => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));

    // // Store in Supabase
    // const { error } = await supabase
    //   .from('profiles')
    //   .upsert({
    //     id: profile.id,
    //     email: profile.email,
    //     full_name: profile.full_name,
    //     avatar_url: profile.avatar_url,
    //     updated_at: new Date().toISOString()
    //   }, {
    //     onConflict: 'id'
    //   });

    // if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error setting user profile:', error);
    return false;
  }
}