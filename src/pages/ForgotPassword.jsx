import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { IconMail, IconArrowLeft } from "@tabler/icons-react";
import AuthVisualSection from "../components/AuthVisualSection";
import "../styles/Auth.css";

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
      alert("Error: " + error.message);
    } else {
      setMessage(
        "Se ha enviado un correo electrónico para restablecer la contraseña.",
      );
    }
    setLoading(false);
  };

  return (
    <div className="container-fluid vh-100 auth-container">
      <div className="row h-100">
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
        <div className="col-lg-6 d-flex flex-column align-items-center h-100 p-4">
          <div className="flex-grow-1 d-flex flex-column justify-content-center w-100 align-items-center">
            <div className="form-wrapper">
              <div className="mb-4 d-flex flex-column align-items-center text-center">
                <img
                  src="/Icon.png"
                  alt="Icono"
                  width={80}
                  className="mb-3 d-lg-none"
                />
                <h1>¿Olvidaste tu contraseña?</h1>
                <p>
                  Ingresa tu correo electrónico y te enviaremos un enlace para
                  restablecerla.
                </p>
              </div>

              {message ? (
                <div className="alert alert-success border-0 shadow-sm p-4 text-center mb-4">
                  <div className="mb-3">
                    <IconMail size={48} className="text-success" />
                  </div>
                  <h4 className="alert-heading h5 fw-bold">¡Correo enviado!</h4>
                  <p className="mb-0 text-secondary">{message}</p>
                </div>
              ) : (
                <form onSubmit={handleResetRequest}>
                  <div className="mb-4">
                    <label className="headline">Correo Electrónico</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <IconMail size={20} stroke={1.5} />
                      </span>
                      <input
                        type="email"
                        className="form-control bg-light p-2"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-submit w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Enlace"}
                  </button>
                </form>
              )}

              <div className="text-center mt-3">
                <Link
                  to="/login"
                  className="text-decoration-none small fw-medium d-flex align-items-center justify-content-center gap-2"
                >
                  <IconArrowLeft size={18} />
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>

          <p className="footer-text">Todos los derechos reservados © 2026</p>
        </div>
      </div>
    </div>
  );
}
