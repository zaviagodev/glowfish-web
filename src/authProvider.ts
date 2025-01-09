import type { AuthProvider } from "@refinedev/core";
import { supabase } from "./lib/supabase";
import { setSupabaseSession } from "@/lib/auth";


export const TOKEN_KEY = "refine-auth";
export const LINE_USER_KEY = "line-user";

// Line auth configuration
const LINE_CONFIG = {
  clientId: import.meta.env.VITE_LINE_CLIENT_ID,
  redirectUri: `${window.location.origin}/line-callback`,
  scope: "profile openid email" 
};

export const authProvider: AuthProvider = {
  login: async ({ providerName, code }) => {
    if (providerName === "line" && code) {
      try {
        // Exchange code for access token using Edge Function
        const { data: tokenData, error: functionError } = await supabase.functions.invoke('line-auth', {
          body: {
            code,
            redirectUri: LINE_CONFIG.redirectUri
          }
        });

        if (functionError) {
          throw new Error("Failed to get access token");
        }

        if(tokenData.type == 1){
          const sessionSet = await setSupabaseSession(tokenData);
          if (!sessionSet) {
            throw new Error('Failed to set session');
          }
          
        }

        // Store tokens and user data
        localStorage.setItem(TOKEN_KEY, tokenData.access_token);
        localStorage.setItem(LINE_USER_KEY, JSON.stringify(tokenData.line_id));
        
        return {
          success: true,
          redirectTo: tokenData.redirect === "register" ? "/phone-verification" : "/home",
        };

      } catch (error) {
        console.error("Line login error:", error);
        return {
          success: false,
          error: {
            name: "LoginError",
            message: "Failed to login with Line",
          },
        };
      }
    }

    return {
      success: false,
      error: {
        name: "LoginError", 
        message: "Invalid login method",
      },
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LINE_USER_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    const userData = localStorage.getItem(LINE_USER_KEY);
    if (userData) {
      const user = JSON.parse(userData);
      return {
        id: user.userId,
        name: user.displayName,
        avatar: user.pictureUrl,
      };
    }
    return null;
  },

  onError: async (error) => {
    console.error(error);
    return { error };
  },
};

// Helper function to initiate Line login
export const loginWithLine = () => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINE_CONFIG.clientId,
    redirect_uri: LINE_CONFIG.redirectUri,
    scope: LINE_CONFIG.scope,
    state: Math.random().toString(36).substring(7),
  });

  window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
};