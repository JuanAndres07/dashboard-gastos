import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import { IconMail, IconArrowLeft } from "@tabler/icons-react";
import AuthVisualSection from "../../components/AuthVisualSection";
import { toast } from "sonner";
import { translateSupabaseError } from "../../utilities/supabaseErrors";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast.error("Error: " + translateSupabaseError(error));
    } else {
      const msg =
        "Se ha enviado un correo electrónico para restablecer la contraseña.";
      setMessage(msg);
      toast.success(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-(--settings-card-bg) overflow-hidden">
      {/* Columna Izquierda: Visual */}
      <AuthVisualSection
        title={
          <>
            <span className="text-primary">Recupera</span> el acceso, <br />
            <span className="text-primary">Retoma</span> el control
          </>
        }
        subtitle={
          <>
            No te preocupes, nos pasa a todos. <br />
            Sigue los pasos para restablecer tu contraseña.
          </>
        }
        badgeText="Seguridad y privacidad garantizada"
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
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-(--text-color) text-sm">
              Ingresa tu correo electrónico y te enviaremos un enlace para
              restablecerla.
            </p>
          </div>

          {message ? (
            <div className="border border-(--sidebar-border) bg-(--settings-card-bg) rounded-2xl shadow-sm p-6 text-center mb-6">
              <div className="mb-4 inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary">
                <IconMail size={40} />
              </div>
              <h3 className="text-lg font-bold text-(--headings-color) mb-2">
                ¡Correo enviado!
              </h3>
              <p className="text-sm text-(--text-color)">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
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

              <button
                type="submit"
                className="w-full bg-primary text-white py-3.5 px-6 rounded-xl font-semibold shadow-[0_4px_15_rgba(0,82,204,0.15)] hover:shadow-[0_8px_25_rgba(0,82,204,0.25)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all duration-300 ease-in-out mt-6"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Enlace"}
              </button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-all duration-300 ease-in-out"
            >
              <IconArrowLeft size={18} />
              Volver al inicio de sesión
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
