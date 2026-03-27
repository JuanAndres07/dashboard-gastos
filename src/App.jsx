import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Register from "./register";
import Login from "./login";

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

  if (!session) {
    return (
      <div>
        <button onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Iniciar sesión" : "Registrarse"}
        </button>
        {isRegister ? <Register /> : <Login />}
      </div>
    );
  } else {
    return (
      <div>
        <h1>Bienvenido, {session.user.email}</h1>
        <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
      </div>
    );
  }
}

export default App;
