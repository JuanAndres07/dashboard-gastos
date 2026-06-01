import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import { IconMail, IconLockPassword } from "@tabler/icons-react";
import AuthVisualSection from "../../components/AuthVisualSection";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("supabase.auth.rememberMe") === "true";
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    localStorage.setItem("supabase.auth.rememberMe", rememberMe);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("Error al iniciar sesión: " + error.message);
    } else {
      console.log("Inicio de sesión exitoso");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-(--settings-card-bg) overflow-hidden">
      {/* Columna Izquierda: Centralizada en AuthVisualSection */}
      <AuthVisualSection
        title={
          <>
            <span className="text-primary">Domina</span> tu dinero, <br />
            <span className="text-primary">Diseña</span> tu futuro
          </>
        }
        subtitle={
          <>
            Gestionar tus gastos no tiene por qué ser complicado. <br />
            Una interfaz limpia para un control total.
          </>
        }
        badgeText="Analítica inteligente en tiempo real"
      />

      {/* Columna Derecha: Formulario de Login */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-between p-6 sm:p-12 min-h-screen">
        <div className="hidden lg:block h-8"></div>

        <div className="w-full max-w-[420px] my-auto flex flex-col justify-center py-8">
          <div className="mb-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <img
              src="/Icon.png"
              alt="Icono"
              width={64}
              className="mb-4 lg:hidden"
            />
            <h1 className="text-3xl font-extrabold tracking-tight text-(--headings-color) mb-2">
              Bienvenido de nuevo
            </h1>
            <p className="text-(--text-color) text-sm">
              Ingrese sus credenciales para acceder a su cuenta.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-(--headings-color) mb-2">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-(--text-color) pointer-events-none">
                  <IconMail size={20} stroke={1.5} />
                </div>
                <input
                  type="email"
                  className="w-full bg-light border border-(--sidebar-border) rounded-xl py-3 pl-12 pr-4 text-(--headings-color) placeholder:text-(--text-color)/40 focus:outline-none focus:border-primary focus:bg-(--settings-card-bg) transition-all duration-300 ease-in-out"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-(--headings-color) mb-2">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-(--text-color) pointer-events-none">
                  <IconLockPassword size={20} stroke={1.5} />
                </div>
                <input
                  type="password"
                  className="w-full bg-light border border-(--sidebar-border) rounded-xl py-3 pl-12 pr-4 text-(--headings-color) placeholder:text-(--text-color)/40 focus:outline-none focus:border-primary focus:bg-(--settings-card-bg) transition-all duration-300 ease-in-out"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-(--sidebar-border) text-primary focus:ring-primary/20 accent-primary"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRememberMe(checked);
                    localStorage.setItem("supabase.auth.rememberMe", checked);
                  }}
                />
                <span className="text-sm text-(--text-color)">Recordarme</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:opacity-80 transition-all duration-300 ease-in-out"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3.5 px-6 rounded-xl font-semibold shadow-[0_4px_15px_rgba(0,82,204,0.15)] hover:shadow-[0_8px_25px_rgba(0,82,204,0.25)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all duration-300 ease-in-out mt-4"
              disabled={loading}
            >
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-(--text-color)">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:opacity-80 transition-all duration-300 ease-in-out"
            >
              Regístrate
            </Link>
          </p>
        </div>

        <p className="text-xs text-(--text-color) opacity-60 mt-auto pt-6 text-center">
          Todos los derechos reservados © 2026
        </p>
      </div>
    </div>
  );
}
