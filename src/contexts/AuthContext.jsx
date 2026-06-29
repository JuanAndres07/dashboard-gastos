import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const pollingStartTimeRef = useRef(null);

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

  // Smart Polling con caducidad para detectar confirmación de correo (Global en el Contexto)
  useEffect(() => {
    if (!user?.new_email) {
      pollingStartTimeRef.current = null;
      return;
    }

    if (!pollingStartTimeRef.current) {
      pollingStartTimeRef.current = Date.now();
    }

    // Límites de tiempo
    const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 horas (límite del enlace de Supabase)
    const MAX_POLLING_DURATION_MS = 15 * 60 * 1000; // 15 minutos de sesión activa
    
    let timeoutId = null;
    let isCancelled = false; // Evita fugas de memoria y llamadas de retorno si el componente se desmonta

    const checkEmailChange = async () => {
      // 1. Evitar consultar la API si la pestaña está oculta
      if (document.visibilityState !== "visible") return true; 

      // 2. Detener si la solicitud original expiró en Supabase (24h)
      if (user.email_change_sent_at) {
        const sentTime = new Date(user.email_change_sent_at).getTime();
        if (Date.now() - sentTime > EXPIRATION_TIME_MS) {
          console.log("La solicitud de cambio de correo expiró en Supabase. Deteniendo smart polling.");
          return false; // Detiene el bucle recursivo
        }
      }

      // 3. Detener si el usuario lleva más de 15 minutos en esta pantalla con la pestaña abierta
      if (Date.now() - pollingStartTimeRef.current > MAX_POLLING_DURATION_MS) {
        console.log("Se alcanzó el límite de 15 minutos para esta sesión de polling. Deteniendo.");
        return false; // Detiene el bucle recursivo
      }

      try {
        const { data, error } = await supabase.auth.getUser();
        if (isCancelled) return false;

        if (!error && data?.user) {
          // Condición de victoria: El correo principal cambió en el servidor
          if (data.user.email !== user.email) {
            // Refrescar sesión para persistir el nuevo token y correo en localStorage
            const { data: refreshData } = await supabase.auth.refreshSession();
            const updatedUser = refreshData?.user || data.user;
            setUser(updatedUser);
            
            toast.success("¡Tu correo electrónico ha sido actualizado con éxito!");
            pollingStartTimeRef.current = null; // Limpiar ref
            return false; // Detiene el bucle recursivo inmediatamente (CONDICIÓN DE VICTORIA)
          }
        }
      } catch (err) {
        console.error("Excepción en smart polling:", err);
      }

      return true; // Continúa con el bucle recursivo
    };

    // Función recursiva con setTimeout para evitar solapamientos de red
    const runPolling = async () => {
      const shouldContinue = await checkEmailChange();
      if (shouldContinue && !isCancelled) {
        timeoutId = setTimeout(runPolling, 7000);
      }
    };

    // Iniciar polling
    timeoutId = setTimeout(runPolling, 7000);

    // Consulta manual inmediata al volver a estar activa la pestaña
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && !isCancelled) {
        const shouldContinue = await checkEmailChange();
        if (!shouldContinue) {
          clearTimeout(timeoutId);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.new_email, user?.email, user?.email_change_sent_at]);

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
      if (!updateError && data?.user) {
        setUser(data.user);
      }
      return { data, error: updateError };
    } catch (err) {
      console.error("Excepción al cambiar el correo:", err);
      return { error: err };
    }
  };

  const cancelEmailChange = async () => {
    if (!user?.email) return { error: new Error("No hay usuario autenticado") };
    try {
      // 1. Llamar a la función RPC para cancelar el cambio en la base de datos
      const { error: rpcError } = await supabase.rpc("cancel_email_change");
      if (rpcError) return { error: rpcError };

      // 2. Refrescar sesión para actualizar la persistencia de localStorage en el SDK
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) return { error: refreshError };
      
      // 3. Forzar que new_email sea nulo en el estado local para asegurar que la UI cambie inmediatamente
      const updatedUser = {
        ...(refreshData?.user || user),
        new_email: null
      };
      setUser(updatedUser);

      return { success: true };
    } catch (err) {
      console.error("Excepción al cancelar el cambio de correo:", err);
      return { error: err };
    }
  };

  const refreshUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error("Excepción al refrescar el usuario:", err);
    }
    return null;
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

  const deleteAccount = async (currentPassword) => {
    if (!user?.email) return { error: new Error("No hay usuario autenticado") };
    try {
      // 1. Re-autenticar al usuario con la contraseña actual
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (authError) return { error: authError };

      // 2. Llamar a la función RPC para eliminar la cuenta de la base de datos
      const { error: deleteError } = await supabase.rpc("delete_user_account");
      if (deleteError) return { error: deleteError };

      // 3. Cerrar la sesión en el cliente (solo sesión local)
      await supabase.auth.signOut({ scope: "local" });

      return { success: true };
    } catch (err) {
      console.error("Excepción al eliminar la cuenta:", err);
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loadingProfile, updateProfile, changeEmail, cancelEmailChange, changePassword, deleteAccount, refreshUser }}>
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
