import {
  Authenticated,
  ErrorComponent,
  Refine
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useTranslation } from "react-i18next"
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import { authProvider } from "./authProvider";
import { Layout } from "./components/layout";
import {
  HomeCreate,
  HomeEdit,
  HomeList,
  HomeShow,
} from "./pages/home";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";
import { ForgotPassword } from "./pages/forgotPassword";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { LineCallback } from "./pages/line-callback";
import PhoneVerification from "./pages/phone-verification";
import TellUsAboutYourself from "./pages/tell-us-about-yourself";
import HistoryPage from "./pages/history";
import MyEventsPage from "./pages/my-events";
import MyEventDetail from "./pages/my-events/detail";
import SettingsPage from "./pages/settings";
import ProfileSettings from "./pages/settings/profile";
import HowToGetPoints from "./pages/settings/how-to-get-points";
import MyRewards from "./pages/my-rewards";
import Rewards from "./pages/rewards";
import RewardDetail from "./pages/rewards/detail";
import CheckoutPage from "./pages/checkout";
import useConfig, { ConfigProvider } from "./hooks/useConfig";
import { useEffect } from "react";

function App() {
  const { t, i18n } = useTranslation();
  const { config } = useConfig();

  useEffect(() => {
    i18n.changeLanguage("en");
  }, [config]);

  const i18nProvider = {
    translate: (key: string, params: Record<string, string>) => t(key, params),
    changeLocale: (lang: string) => {
      localStorage.setItem("locale", lang);
      return i18n.changeLanguage(lang);
    },
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <DevtoolsProvider>
          <Refine
            dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
            routerProvider={routerBindings}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
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
                <Route path="/login" element={<Login />} />
                <Route path="/line-callback" element={<LineCallback />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/phone-verification" element={<PhoneVerification />} />
                <Route path="/tell-us-about-yourself" element={<TellUsAboutYourself />} />

                {/* Protected Routes */}
                <Route
                  element={
                    <Authenticated
                      key="authenticated-routes"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <Outlet />
                    </Authenticated>
                  }
                >
                  <Route index element={<HomeList />} />
                  <Route path="/history" element={<HistoryPage />}/>
                  <Route path="/checkout" element={<CheckoutPage />}/>
                  <Route path="/my-events">
                    <Route index element={<MyEventsPage />} />
                    <Route path="detail/:id" element={<MyEventDetail />} />
                  </Route>
                  <Route path="/my-rewards" element={<MyRewards />}/>
                  <Route path="/rewards">
                    <Route index element={<Rewards />} />
                    <Route path="detail/:id" element={<RewardDetail />}/>
                  </Route>
                  <Route path="/settings">
                    <Route index element={<SettingsPage />} />
                    <Route path="profile" element={<ProfileSettings />} />
                   <Route path="how-to-get-points" element={<HowToGetPoints />} />
                  </Route>
                  <Route path="/home">
                    <Route index element={<HomeList />} />
                    <Route path="create" element={<HomeCreate />} />
                    <Route path="edit/:id" element={<HomeEdit />} />
                    <Route path="show/:id" element={<HomeShow />} />
                  </Route>
                  <Route path="/categories">
                    <Route index element={<CategoryList />} />
                    <Route path="create" element={<CategoryCreate />} />
                    <Route path="edit/:id" element={<CategoryEdit />} />
                    <Route path="show/:id" element={<CategoryShow />} />
                  </Route>
                </Route>

                <Route path="*" element={<ErrorComponent />} />
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
      <App />
    </ConfigProvider>
  );
}

export default AppWrapper;