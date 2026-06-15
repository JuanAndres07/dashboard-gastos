import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "./lib/supabase";

// Pages (Lazy Loaded)
const Register = lazy(() => import("./pages/auth/Register"));
const Login = lazy(() => import("./pages/auth/Login"));
const ConfirmEmail = lazy(() => import("./pages/auth/ConfirmEmail"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/auth/UpdatePassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Categories = lazy(() => import("./pages/Categories"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Analysis = lazy(() => import("./pages/Analysis"));
const Configuration = lazy(() => import("./pages/Configuration"));

// Components
import Layout from "./components/Layout";
import CustomToaster from "./components/CustomToaster";
import ErrorBoundary from "./components/ErrorBoundary";

// Loading component for Suspense and initial load
const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" role="status">
      <span className="sr-only">Cargando...</span>
    </div>
  </div>
);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);

      // Catch password recovery event
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      } else if (event === "SIGNED_OUT") {
        // When we finish the process and log out, we release the "kidnapping" of the interface
        setIsRecovery(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <CustomToaster />
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {isRecovery ? (
              <Route path="*" element={<UpdatePassword />} />
            ) : !session ? (
              // Public Routes
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : (
              // Private Routes
              <>
                {/* Special route for authenticated user */}
                <Route path="/update-password" element={<UpdatePassword />} />

                {/* Routes with Sidebar and Dashboard Layout */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard user={session.user} />} />
                  <Route
                    path="/transactions"
                    element={<Transactions user={session.user} />}
                  />
                  <Route
                    path="/categories"
                    element={<Categories user={session.user} />}
                  />
                  <Route
                    path="/subscriptions"
                    element={<Subscriptions user={session.user} />}
                  />
                  <Route
                    path="/budgets"
                    element={<Budgets user={session.user} />}
                  />
                  <Route
                    path="/analysis"
                    element={<Analysis user={session.user} />}
                  />
                  <Route
                    path="/configuration"
                    element={<Configuration user={session.user} />}
                  />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
