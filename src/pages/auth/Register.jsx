import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { IconMail, IconLockPassword, IconUser } from "@tabler/icons-react";
import AuthVisualSection from "../../components/AuthVisualSection";
import { toast } from "sonner";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.warning("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      console.error("Error al registrar:", error.message);
      if (
        error.status === 400 ||
        error.message.includes("already registered")
      ) {
        toast.error(
          "Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión.",
        );
      } else {
        toast.error("Error al registrar: " + error.message);
      }
    } else {
      if (data?.user?.identities?.length === 0) {
        toast.error(
          "Este correo ya está registrado. Por favor, intenta iniciar sesión.",
        );
      } else {
        toast.success(
          "¡Registro exitoso! Por favor verifica tu correo electrónico.",
        );
        navigate("/confirm-email");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-(--settings-card-bg) overflow-hidden">
      {/* Columna Izquierda: Centralizada en AuthVisualSection */}
      <AuthVisualSection
        title={
          <>
            <span className="text-primary">Comienza</span> tu viaje <br />
            <span className="text-primary">alcanza</span> tus metas
          </>
        }
        subtitle={
          <>
            Gestionar tus gastos no tiene por qué ser complicado. <br />
            Una interfaz limpia para un control total de tu presupuesto.
          </>
        }
        badgeText="Gestión inteligente de presupuestos"
      />

      {/* Columna Derecha: Formulario de Registro */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-between p-6 sm:p-12 min-h-screen">
        <div className="hidden lg:block h-8"></div>

        <div className="w-full max-w-105 my-auto flex flex-col justify-center py-8">
          <div className="mb-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <img
              src="/Icon.png"
              alt="Icono"
              width={64}
              className="mb-4 lg:hidden"
            />
            <h1 className="text-3xl font-extrabold tracking-tight text-(--headings-color) mb-2">
              Crea tu cuenta
            </h1>
            <p className="text-(--text-color) text-sm">
              Completa los siguientes datos para comenzar.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-(--headings-color) mb-2">
                Nombre Completo
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-(--text-color) pointer-events-none">
                  <IconUser size={20} stroke={1.5} />
                </div>
                <input
                  type="text"
                  className="w-full bg-light border border-(--sidebar-border) rounded-xl py-3 pl-12 pr-4 text-(--headings-color) placeholder:text-(--text-color)/40 focus:outline-none focus:border-primary focus:bg-(--settings-card-bg) transition-all duration-300 ease-in-out"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-(--headings-color) mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-(--text-color) pointer-events-none">
                  <IconLockPassword size={20} stroke={1.5} />
                </div>
                <input
                  type="password"
                  className="w-full bg-light border border-(--sidebar-border) rounded-xl py-3 pl-12 pr-4 text-(--headings-color) placeholder:text-(--text-color)/40 focus:outline-none focus:border-primary focus:bg-(--settings-card-bg) transition-all duration-300 ease-in-out"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3.5 px-6 rounded-xl font-semibold shadow-[0_4px_15_rgba(0,82,204,0.15)] hover:shadow-[0_8px_25_rgba(0,82,204,0.25)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all duration-300 ease-in-out mt-6"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-(--text-color)">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:opacity-80 transition-all duration-300 ease-in-out"
            >
              Inicia sesión
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
