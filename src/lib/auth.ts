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
  customer?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
  email?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
}

// Verify OTP and create/update user
export const verifyOTP = async (
  otp: string,
  phone: string,
  verification_token: string,
  store_name: string,
): Promise<VerifyOTPResponse> => {
  try {
    const token = localStorage.getItem("refine-auth");
    const lineUser = JSON.parse(localStorage.getItem("line-user") || "{}");

    const { data: tokenData, error } = await supabase.functions.invoke('verify-otp', {
      body: {
        otp,
        phone,
        token: verification_token,
        line_id: lineUser.userId,
        access_token: token,
        store_name
      },
    });

    if (error) throw tokenData;

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
      error: error instanceof Error ? error.message : 'Failed to verify OTP'
    };
  }
};

// Handle Line authentication
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
      error: error instanceof Error ? error.message : 'Failed to authenticate with Line'
    };
  }
};

// Set Supabase session and user profile
export const setSupabaseSession = async (tokenData: TokenData): Promise<boolean> => {
  try {
    const { access_token, refresh_token, customer, email } = tokenData;

    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) throw sessionError;

    if (customer) {
      const { id, email: customerEmail, full_name, avatar_url } = customer;
      await setUserProfile({
        id,
        email: customerEmail || email || '',
        full_name,
        avatar_url,
      });
    }

    return true;
  } catch (error) {
    console.error('Error setting session:', error);
    return false;
  }
};

// Get user profile from storage
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
    if (!storedProfile) {
      // Try to fetch from Supabase if not in localStorage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (customer) {
          const profile: UserProfile = {
            id: customer.id,
            email: customer.email,
            full_name: customer.full_name,
            avatar_url: customer.avatar_url,
            phone: customer.phone
          };
          await setUserProfile(profile);
          return profile;
        }
      }
      return null;
    }
    return JSON.parse(storedProfile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Set user profile in storage and optionally update Supabase
export const setUserProfile = async (profile: UserProfile, updateSupabase: boolean = false): Promise<boolean> => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));

    if (updateSupabase) {
      const { error } = await supabase
        .from('customers')
        .update({
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error setting user profile:', error);
    return false;
  }
};

// Clear auth data
export const clearAuthData = async (): Promise<void> => {
  localStorage.removeItem(USER_PROFILE_KEY);
  localStorage.removeItem("refine-auth");
  localStorage.removeItem("line-user");
  await supabase.auth.signOut();
};