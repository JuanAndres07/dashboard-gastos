import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { IconLockPassword, IconArrowLeft } from "@tabler/icons-react";
import AuthVisualSection from "../../components/AuthVisualSection";

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert("Error al actualizar la contraseña: " + error.message);
    } else {
      await supabase.auth.signOut();
      alert(
        "Contraseña actualizada correctamente. Por favor, inicia sesión con tu nueva contraseña.",
      );
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-(--settings-card-bg) overflow-hidden">
      {/* Columna Izquierda: Visual */}
      <AuthVisualSection
        title={
          <>
            <span className="text-primary">Nueva</span> seguridad, <br />
            <span className="text-primary">Misma</span> confianza
          </>
        }
        subtitle={
          <>
            Estás a un paso de recuperar tu cuenta. <br />
            Crea una contraseña sólida y fácil de recordar.
          </>
        }
        badgeText="Protección de datos de nivel bancario"
      />

      {/* Columna Derecha: Formulario */}
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
              Actualizar Contraseña
            </h1>
            <p className="text-(--text-color) text-sm">
              Ingresa tu nueva contraseña para asegurar tu cuenta.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-(--headings-color) mb-2">
                Nueva Contraseña
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-(--text-color) pointer-events-none">
                  <IconLockPassword size={20} stroke={1.5} />
                </div>
                <input
                  type="password"
                  className="w-full bg-light border border-(--sidebar-border) rounded-xl py-3 pl-12 pr-4 text-(--headings-color) placeholder:text-(--text-color)/40 focus:outline-none focus:border-primary focus:bg-(--settings-card-bg) transition-all duration-300 ease-in-out"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
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
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3.5 px-6 rounded-xl font-semibold shadow-[0_4px_15_rgba(0,82,204,0.15)] hover:shadow-[0_8px_25_rgba(0,82,204,0.25)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all duration-300 ease-in-out mt-6"
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-all duration-300 ease-in-out"
            >
              <IconArrowLeft size={18} />
              Cancelar y volver al login
            </Link>
          </div>
        </div>

        <p className="text-xs text-(--text-color) opacity-60 mt-auto pt-6 text-center">
          Todos los derechos reservados © 2026
        </p>
      </div>
    </div>
  );
}
