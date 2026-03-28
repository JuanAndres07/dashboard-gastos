import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

//Pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";

function App() {
  const [session, setSession] = useState(null);
  const [isRegister, setIsRegister] = useState(false);

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
        {!session ? (
          <>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="*" element={<Navigate to="/login" />}></Route>
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard />}></Route>
            <Route path="/transactions" element={<Transactions />}></Route>
            <Route path="*" element={<Navigate to="/" />}></Route>
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
