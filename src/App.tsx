import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useTranslation } from "react-i18next";
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
import { authProvider } from "./authProvider";
import { Layout } from "./components/layout";
import { HomeList } from "@/page/home";
import { AuthPage } from "@/page/auth";
import { TellUsAboutYourself } from "@/features/auth/components/TellUsAboutYourself";
import SettingsPage from "./page/settings";
import Rewards from "./page/rewards";
import useConfig, { ConfigProvider } from "./hooks/useConfig";
import { useEffect } from "react";
import MyOrdersPage from "./page/orders";
import MyPointsPage from "./page/points";
import TicketsPage from "./page/tickets";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import ProductsPage from "./page/products";
import { HowToGetPoints } from "@/features/points";
import OrdersPage from "@/page/orders";
import ProfilePage from "@/page/profile";
import ScanPage from "@/page/scan";
import InfoPage from "@/page/info";
import OrderFlow from "@/page/OrderFlow";

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
        localStorage.setItem("store", store);
      }
    }, [searchParams]);

    return null;
  };

  const LineCallbackRedirect = () => {
    const { search } = useLocation();
    return <Navigate to={`/auth/line-callback${search}`} replace />;
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <DevtoolsProvider>
          {/* Add StoreHandler at the top level */}
          <ScrollToTop />
          <StoreHandler />
          <Refine
            dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
            routerProvider={routerBindings}
            authProvider={authProvider}
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
                <Route path="/login" element={<Navigate to="/auth/login" replace />} />
                <Route path="/line-callback" element={<LineCallbackRedirect />} />
                <Route path="/phone-verification" element={<Navigate to="/auth/phone-verification" replace />} />
                <Route path="/tell-us-about-yourself" element={<Navigate to="/auth/tell-us-about-yourself" replace />} />
                
                {/* Auth routes */}
                <Route path="auth/*" element={<AuthPage />} />
                <Route
                  path="/tell-us-about-yourself"
                  element={<TellUsAboutYourself />}
                />

                {/* Protected Routes */}
                <Route
                  element={
                    <Authenticated
                      key="authenticated-routes"
                      fallback={<CatchAllNavigate to="/auth/login" />}
                    >
                      <Outlet />
                    </Authenticated>
                  }
                >
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
                    <Route path="how-to-get-points" element={<HowToGetPoints />} />
                  </Route>

                  <Route path="/my-orders">
                    <Route index element={<MyOrdersPage />} />
                    <Route path=":id" element={<MyOrdersPage />} />
                  </Route>
                  <Route path="/tickets" element={<TicketsPage />} />
                  <Route path="/tickets/:id" element={<TicketsPage />} />

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
            <DocumentTitleHandler />
          </Refine>
          <DevtoolsPanel />
        </DevtoolsProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

function AppWrapper() {
  return (
    <ConfigProvider>
      <ToastProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ToastProvider>
    </ConfigProvider>
  );
}

export default AppWrapper;
