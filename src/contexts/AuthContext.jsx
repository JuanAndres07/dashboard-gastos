import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = async (userId) => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error al obtener el perfil:", error.message);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Excepción al obtener el perfil:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error("No hay usuario autenticado") };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
      }
      return { data, error };
    } catch (err) {
      console.error("Excepción al actualizar el perfil:", err);
      return { error: err };
    }
  };

  const changeEmail = async (currentPassword, newEmail) => {
    if (!user?.email) return { error: new Error("No hay usuario autenticado") };
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (authError) return { error: authError };

      const { data, error: updateError } = await supabase.auth.updateUser({ email: newEmail });
      return { data, error: updateError };
    } catch (err) {
      console.error("Excepción al cambiar el correo:", err);
      return { error: err };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user?.email) return { error: new Error("No hay usuario autenticado") };
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (authError) return { error: authError };

      const { data, error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      return { data, error: updateError };
    } catch (err) {
      console.error("Excepción al cambiar la contraseña:", err);
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loadingProfile, updateProfile, changeEmail, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
