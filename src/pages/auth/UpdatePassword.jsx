import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import AuthVisualSection from "../../components/AuthVisualSection";
import PasswordInput from "../../components/PasswordInput";
import { toast } from "sonner";
import { translateSupabaseError } from "../../utilities/supabaseErrors";

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.warning("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error("Error al actualizar la contraseña: " + translateSupabaseError(error));
    } else {
      await supabase.auth.signOut();
      toast.success(
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

        <div className="w-full max-w-105 my-auto flex flex-col justify-center py-8">
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
            <PasswordInput
              label="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />

            <PasswordInput
              label="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />

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
