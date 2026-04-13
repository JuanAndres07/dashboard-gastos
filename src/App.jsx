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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Route WITHOUT Sidebar */}
        <Route path="/update-password" element={<UpdatePassword />} />

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

            {/* General fallback for authenticated users */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
