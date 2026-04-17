import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

//Pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import ConfirmEmail from "./pages/ConfirmEmail";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";

//Components
import SideBar from "./components/SideBar";

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
      
      // Capturamos el evento específico de recuperación de contraseña
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      } else if (event === "SIGNED_OUT") {
        // Cuando terminamos el proceso y se cierra sesión, liberamos el "secuestro" de la interfaz
        setIsRecovery(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si detectamos el evento de recuperación de contraseña, forzamos la vista
  // IMPORTANTE: Esto arregla el caso donde Supabase envía al usuario a "/" por falta de configuración del "Redirect URL"
  if (isRecovery) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<UpdatePassword />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {!session ? (
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
            {/* Rutas especiales para usuarios autenticados sin el layout del dashboard */}
            <Route path="/update-password" element={<UpdatePassword />} />

            {/* Routes WITH Sidebar (Nested Layout) */}
            <Route
              element={
                <div className="d-flex w-100 min-vh-100">
                  <SideBar />
                  <main className="flex-grow-1 p-4 bg-light text-start">
                    <Outlet />
                  </main>
                </div>
              }
            >
              <Route path="/" element={<Dashboard user={session.user} />} />
              <Route
                path="/transactions"
                element={<Transactions user={session.user} />}
              />
              <Route
                path="/categories"
                element={<Categories user={session.user} />}
              />
            </Route>

          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
