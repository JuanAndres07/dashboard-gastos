import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { user } = useAuth();

  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return systemPrefersDark ? "dark" : "light";
  });

  // Solo pinta el tema en la pantalla (HTML), NO escribe en localStorage
  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Sincronizar el tema cuando el usuario cambie o inicie sesión
  useEffect(() => {
    if (user?.id) {
      fetchUserTheme(user.id);
    }
  }, [user]);

  const fetchUserTheme = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("theme")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error(
          "Error al obtener el tema desde Supabase:",
          error.message,
        );
        return;
      }

      const localTheme = localStorage.getItem("theme");

      if (localTheme === null) {
        // 1. El localStorage está vacío (null) -> Confía en Supabase y usa el tema de la nube
        if (data && (data.theme === "light" || data.theme === "dark")) {
          setThemeState(data.theme);
        } else {
          // Si Supabase tampoco tiene nada, sincronizamos el tema actual detectado por el sistema
          await syncThemeToSupabase(userId, theme);
        }
      } else {
        // 2. El localStorage tiene algo -> El usuario hizo clic en el botón. Ignora Supabase y usa el caché local.
        // Si la base de datos difiere del caché local del usuario, la actualizamos para alinearla.
        if (!data || data.theme !== localTheme) {
          await syncThemeToSupabase(userId, localTheme);
        }
      }
    } catch (err) {
      console.error("Excepción al cargar el tema del usuario:", err);
    }
  };

  const syncThemeToSupabase = async (userId, targetTheme) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ theme: targetTheme })
        .eq("user_id", userId);

      if (error) {
        console.error(
          "Error al sincronizar el tema con Supabase:",
          error.message,
        );
      }
    } catch (err) {
      console.error("Excepción al sincronizar el tema:", err);
    }
  };

  const setTheme = async (newTheme) => {
    if (newTheme !== "light" && newTheme !== "dark") return;
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme); // Guarda solo en la acción manual (setTheme)

    if (user?.id) {
      await syncThemeToSupabase(user.id, newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}
