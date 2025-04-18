import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import Cookies from "js-cookie";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useTranslation } from "react-i18next";
import { HelmetProvider, Helmet } from "react-helmet-async";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
  useSearchParams,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "./i18n";
import i18n from "i18next";
import { authProvider } from "./authProvider";
import { Layout } from "./components/layout";
import { HomeList } from "@/pages/home";
import { AuthPage } from "@/pages/auth";
import { TellUsAboutYourself } from "@/features/auth/components/TellUsAboutYourself";
import SettingsPage from "./pages/settings";
import Rewards from "./pages/rewards";
import useConfig, { ConfigProvider } from "./hooks/useConfig";
import { useEffect, useState } from "react";
import MyOrdersPage from "./pages/orders";
import MyPointsPage from "./pages/points";
import TicketsPage from "./pages/tickets";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "./hooks/useTheme";
import EventsPage from "./pages/events";
import ProductsPage from "./pages/products";
import { HowToGetPoints } from "@/features/points";
import OrdersPage from "@/pages/orders";
import ProfilePage from "@/pages/profile";
import ScanPage from "@/pages/scan";
import InfoPage from "@/pages/info";
import OrderFlow from "@/pages/OrderFlow";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import MyRewardsPage from "./pages/my-rewards";
import { DynamicTitle } from "./components/DynamicTitle";

function App() {
  const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);

    return null;
  };

  const StoreHandler = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
      const store = searchParams.get("store");
      if (store) {
        Cookies.set("store_name", store);
      }
    }, [searchParams]);

    return null;
  };

  const LineCallbackRedirect = () => {
    const { search } = useLocation();
    return <Navigate to={`/auth/line-callback${search}`} replace />;
  };

  return (
    <>
      <RefineKbarProvider>
        <DevtoolsProvider>
          {/* Add StoreHandler at the top level */}
          <ScrollToTop />
          <StoreHandler />
          <Refine
            dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
            routerProvider={routerBindings}
            authProvider={authProvider}
            i18nProvider={{
              translate: (key) => i18n.t(key),
              changeLocale: (lang) => i18n.changeLanguage(lang),
              getLocale: () => i18n.language,
            }}
            resources={[
              {
                name: "home",
                list: "/home",
                create: "/home/create",
                edit: "/home/edit/:id",
                show: "/home/show/:id",
                meta: {
                  canDelete: true,
                },
              },
              {
                name: "categories",
                list: "/categories",
                create: "/categories/create",
                edit: "/categories/edit/:id",
                show: "/categories/show/:id",
                meta: {
                  canDelete: true,
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              useNewQueryKeys: true,
              projectId: "UtpLjx-1BQtOL-U4jwRn",
            }}
          >
            <Routes>
              <Route
                element={
                  <Layout>
                    <Outlet />
                  </Layout>
                }
              >
                {/* Redirect from old paths to new auth paths */}
                <Route
                  path="/login"
                  element={<Navigate to="/auth/login" replace />}
                />
                <Route
                  path="/line-callback"
                  element={<LineCallbackRedirect />}
                />

                {/* Auth routes */}
                <Route path="auth/*" element={<AuthPage />} />
                <Route
                  path="/tell-us-about-yourself"
                  element={<TellUsAboutYourself />}
                />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route index element={<HomeList />} />
                  {/* Order Flow Routes */}

                
                  <Route path="/cart" element={<OrderFlow />} />
                  <Route path="/checkout/*" element={<OrderFlow />} />
                  <Route path="/payment/*" element={<OrderFlow />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/rewards">
                    <Route index element={<Rewards />} />
                    <Route path=":id" element={<Rewards />} />
                  </Route>
                  <Route path="/my-rewards">
                    <Route index element={<MyRewardsPage />} />
                    <Route path=":orderId" element={<MyRewardsPage />} />
                  </Route>
                  <Route path="/events" element={<ProductsPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/settings">
                    <Route index element={<SettingsPage />} />
                    <Route path="points" element={<MyPointsPage />} />
                  </Route>

                  <Route path="/scan" element={<ScanPage />} />
                  <Route path="/info">
                    <Route index element={<InfoPage />} />
                    <Route path="how-to-get-points" element={<InfoPage />} />
                    <Route path="how-to-spend-points" element={<InfoPage />} />
                    <Route path="member-level" element={<InfoPage />} />
                  </Route>

                  <Route path="/points">
                    <Route index element={<MyPointsPage />} />
                    <Route
                      path="how-to-get-points"
                      element={<HowToGetPoints />}
                    />
                  </Route>

                  <Route path="/my-orders">
                    <Route index element={<MyOrdersPage />} />
                    <Route path=":id" element={<MyOrdersPage />} />
                  </Route>
                  <Route path="/tickets" element={<TicketsPage />} />
                  <Route path="/tickets/:id" element={<TicketsPage />} />
                  <Route
                    path="/tickets/:id/:ticketId"
                    element={<TicketsPage />}
                  />

                  <Route path="/home">
                    <Route index element={<HomeList />} />
                  </Route>
                  <Route path="/orders">
                    <Route index element={<OrdersPage />} />
                    <Route path=":id" element={<OrdersPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<div>404</div>} />
              </Route>
            </Routes>

            <RefineKbar />
            <UnsavedChangesNotifier />
          </Refine>
          <DevtoolsPanel />
        </DevtoolsProvider>
      </RefineKbarProvider>
    </>
  );
}

function AppWrapper() {
  const [initialized, setInitialized] = useState(false);

  // Initialize i18n 
  useEffect(() => {
    // Get saved language from localStorage or default to Thai
    const savedLanguage = localStorage.getItem('locale') || 'th';
    
    // Set default in localStorage if not already set
    if (!localStorage.getItem('locale')) {
      localStorage.setItem('locale', 'th');
    }
    
    // Log current language 
    console.log("App init - Current language:", i18n.language);
    console.log("App init - Saved language:", savedLanguage);
    
    // Force change language to ensure it's loaded
    i18n.changeLanguage(savedLanguage).then(() => {
      console.log("App init - Language changed to:", i18n.language);
      setInitialized(true);
    });
  }, []);

  return (
    <ConfigProvider>
      <ToastProvider>
        <ThemeProvider>
          <BrowserRouter>
            <HelmetProvider>
              <DynamicTitle />
              <App />
            </HelmetProvider>
          </BrowserRouter>
        </ThemeProvider>
      </ToastProvider>
    </ConfigProvider>
  );
}

export default AppWrapper;
