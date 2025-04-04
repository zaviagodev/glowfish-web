// src/authProvider.ts
import type { AuthProvider } from "@refinedev/core";
import { supabase } from "./lib/supabase";
import { setSupabaseSession } from "@/lib/auth";
import { custom } from "zod";
import { useStore } from "@/hooks/useStore";

export const TOKEN_KEY = "refine-auth";
export const LINE_USER_KEY = "line-user";

// Line auth configuration
const LINE_CONFIG = {
  clientId: import.meta.env.VITE_LINE_CLIENT_ID,
  redirectUri: `${window.location.hostname === 'localhost' ? 'http' : 'https'}://${
    import.meta.env.VITE_CALLBACK_DOMAIN || window.location.hostname + (window.location.hostname === 'localhost' ? `:${window.location.port}` : '')
  }${import.meta.env.VITE_CALLBACK_DOMAIN ? '/line/callback' : '/line-callback'}?original_domain=${encodeURIComponent(window.location.hostname)}`,
  scope: "profile openid email",
};

const isStorefrontMode = () => import.meta.env.VITE_STOREFRONT_MODE === "1";

// Function to create test session
export const createTestSession = async () => {
  try {
    // Create anonymous session with limited permissions
    const { data: { session = null }, error } = await supabase.auth.signInWithPassword(
      {
        email: import.meta.env.VITE_TEST_EMAIL || "test@example.com",
        password: import.meta.env.VITE_TEST_PASSWORD || "test123",
      },
    );

    if (error) throw error;

    // Get or create test customer
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", session?.user?.email)
      .single();

    if (customerError && customerError.code !== "PGRST116") {
      throw customerError;
    }

    let testCustomer = customer;

    if (!testCustomer) {
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert({
          email: session?.user?.email,
          first_name: "Test",
          last_name: "User",
          store_name: "glowfish",
          is_verified: true,
          meta: {
            is_test_account: true,
          },
        })
        .select()
        .single();

      if (createError) throw createError;
      testCustomer = newCustomer;
    }

    const testSession = {
      access_token: session?.access_token || "" ,
      refresh_token: session?.refresh_token || "",
      user: session?.user || null,
      customer: testCustomer,
    };
    await setSupabaseSession(testSession);
    return {
      success: true,
      redirectTo: "/home",
    };
  } catch (error) {
    console.error("Error creating test session:", error);
    throw error;
  }
};

export const authProvider: AuthProvider = {
  login: async ({ providerName, code, storeName }) => {
    // For storefront mode
    if (isStorefrontMode()) {
      try {
        const testSession = await createTestSession();
        return testSession;
        
        return {
          success: true,
          redirectTo: "/home",
        };
      } catch (error) {
        console.error("Test login error:", error);
        return {
          success: false,
          error: {
            name: "LoginError",
            message: "Failed to create test session",
          },
        };
      }
    }

    if (providerName === "line" && code) {
      try {
        // Exchange code for access token using Edge Function
        const { data: tokenData, error: functionError } = await supabase
          .functions.invoke("line-auth", {
            body: {
              code,
              redirectUri: LINE_CONFIG.redirectUri,
              storeName: storeName,
            },
          });
        if (functionError) {
          throw new Error("Failed to get access token");
        }

        if (tokenData.type == 1) {
          const sessionSet = await setSupabaseSession(tokenData);
          if (!sessionSet) {
            throw new Error("Failed to set session");
          }
        }

        // Store tokens and user data
        localStorage.setItem(TOKEN_KEY, tokenData.access_token);
        localStorage.setItem(LINE_USER_KEY, JSON.stringify(tokenData.line_id));

        return {
          success: true,
          redirectTo: tokenData.redirect === "register"
            ? "/auth/phone-verification"
            : "/home",
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
    localStorage.removeItem("user_profile");
    localStorage.removeItem("cached_events");
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    if (isStorefrontMode()) {
      const { data: { session } } = await supabase.auth.getSession();
      return {
        authenticated: !!session,
      };
    }

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
    if (isStorefrontMode()) {
      const { data: { user } } = await supabase.auth.getUser();
      const { storeName } = useStore();
      if (!user) return null;

      const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("auth_id", user.id)
        .eq("store_name", storeName)
        .single();

      return {
        id: user.id,
        name: customer?.full_name || "Test User",
        email: customer?.email || user.email,
        avatar: customer?.avatar_url || "",
      };
    }

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
  if (isStorefrontMode()) {
    window.location.href = "/line-callback?code=test-code";
    return;
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINE_CONFIG.clientId,
    redirect_uri: LINE_CONFIG.redirectUri,
    scope: LINE_CONFIG.scope,
    state: Math.random().toString(36).substring(7), // Random state for security
  });

  window.location.href =
    `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
};
