import type { AuthProvider } from "@refinedev/core";
import { supabase } from "./lib/supabase";
import { setSupabaseSession } from "@/lib/auth";

export const TOKEN_KEY = "refine-auth";
export const LINE_USER_KEY = "line-user";

// Test session data for storefront mode
const TEST_SESSION = {
  access_token: "eyJhbGciOiJIUzI1NiIsImtpZCI6Iks1THZiRzAraXJ1N0owdVUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3p6eHpxcWhibWpwZ2d4cXNud3l4LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIxYTYyZjk2MS0zMTM0LTRhNjctYjU0My1jMmFmODYxMjJlYzIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM2NDE4MTAzLCJpYXQiOjE3MzY0MTQ1MDMsImVtYWlsIjoidGVzdDIyQGdtaWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6InRlc3QyMkBnbWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJOYWJlZWwgVGFoaXIiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN0b3JlX25hbWUiOiJnbG93ZmlzaCIsInN1YiI6IjFhNjJmOTYxLTMxMzQtNGE2Ny1iNTQzLWMyYWY4NjEyMmVjMiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im90cCIsInRpbWVzdGFtcCI6MTczNjQxNDUwM31dLCJzZXNzaW9uX2lkIjoiM2FlMTdkN2UtOGFlMi00ZmQ5LTkyMGUtNDk1YmI3YzBlOGI5IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.ktNuVDBZovz1p29lcHRIykwTdwp0QQIwUOkljPaT460",
  refresh_token: "FJyhY3JPyxDCdKhEK_JawQ",
  user: {
    id: "1a62f961-3134-4a67-b543-c2af86122ec2",
    email: "test22@gmil.com",
    user_metadata: {
      email: "test22@gmil.com",
      email_verified: true,
      full_name: "Nabeel Tahir",
      phone_verified: false,
      store_name: "glowfish"
    }
  }
};

// Line auth configuration
const LINE_CONFIG = {
  clientId: import.meta.env.VITE_LINE_CLIENT_ID,
  redirectUri: `${window.location.origin}/line-callback`,
  scope: "profile openid email" 
};

const isStorefrontMode = () => import.meta.env.VITE_STOREFRONT_MODE === "1";

// Helper function to clear all auth-related storage
const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LINE_USER_KEY);
  localStorage.removeItem('user_profile');
  localStorage.removeItem('cached_events');
};

export const authProvider: AuthProvider = {
  login: async ({ providerName, code }) => {
    try {
      // Handle storefront mode
      if (isStorefrontMode()) {
        await supabase.auth.setSession({
          access_token: TEST_SESSION.access_token,
          refresh_token: TEST_SESSION.refresh_token
        });
        localStorage.setItem(TOKEN_KEY, TEST_SESSION.access_token);
        localStorage.setItem(LINE_USER_KEY, JSON.stringify(TEST_SESSION.user));
        localStorage.setItem('user_profile', JSON.stringify(TEST_SESSION.user));
        return {
          success: true,
          redirectTo: "/home"
        };
      }

      // Handle Line login
      if (providerName === "line" && code) {
        const { data: tokenData, error: functionError } = await supabase.functions.invoke('line-auth', {
          body: {
            code,
            redirectUri: LINE_CONFIG.redirectUri
          }
        });

        if (functionError) throw new Error("Failed to get access token");

        if (tokenData.type === 1) {
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
      }

      throw new Error("Invalid login method");
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error instanceof Error ? error.message : "Failed to login",
        },
      };
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      clearAuthStorage();
      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: {
          name: "LogoutError",
          message: "Failed to logout",
        },
      };
    }
  },

  check: async () => {
    try {
      if (isStorefrontMode()) {
        return { authenticated: true };
      }

      const { data: { session } } = await supabase.auth.getSession();
      return {
        authenticated: !!session,
        redirectTo: session ? undefined : "/login",
      };
    } catch (error) {
      console.error("Auth check error:", error);
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  getPermissions: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.role || null;
    } catch (error) {
      console.error("Get permissions error:", error);
      return null;
    }
  },

  getIdentity: async () => {
    try {
      if (isStorefrontMode()) {
        return {
          id: TEST_SESSION.user.id,
          name: TEST_SESSION.user.user_metadata.full_name,
          email: TEST_SESSION.user.email,
          avatar: ""
        };
      }

      const userData = localStorage.getItem(LINE_USER_KEY);
      if (!userData) return null;

      const user = JSON.parse(userData);
      return {
        id: user.userId,
        name: user.displayName,
        avatar: user.pictureUrl,
      };
    } catch (error) {
      console.error("Get identity error:", error);
      return null;
    }
  },

  onError: async (error) => {
    console.error("Auth error:", error);
    const notAuthenticated = error.statusCode === "UNAUTHENTICATED";
    if (notAuthenticated) {
      clearAuthStorage();
      return {
        error,
        logout: true,
        redirectTo: "/login",
      };
    }
    return { error };
  },
};

// Helper function to initiate Line login
export const loginWithLine = () => {
  if (isStorefrontMode()) {
    window.location.href = '/line-callback?code=test-code';
    return;
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINE_CONFIG.clientId,
    redirect_uri: LINE_CONFIG.redirectUri,
    scope: LINE_CONFIG.scope,
    state: Math.random().toString(36).substring(7),
  });

  window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
};