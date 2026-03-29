import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

//Pages
import Register from "./pages/Register";
import Login from "./pages/Login";
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
      {!session ? (
        <>
          <Routes>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="*" element={<Navigate to="/login" />}></Route>
          </Routes>
        </>
      ) : (
        <>
          <div className="d-flex w-100 min-vh-100">
            <SideBar />
            <main className="flex-grow-1 p-4 bg-light text-start">
              <Routes>
                <Route path="/" element={<Dashboard />}></Route>
                <Route path="/transactions" element={<Transactions />}></Route>
                <Route path="/categories" element={<Categories />}></Route>
                <Route path="*" element={<Navigate to="/" />}></Route>
              </Routes>
            </main>
          </div>
        </>
      )}
    </BrowserRouter>
  );
}

export default App;
