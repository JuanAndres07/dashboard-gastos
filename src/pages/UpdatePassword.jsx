import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { IconLockPassword, IconArrowLeft } from "@tabler/icons-react";
import AuthVisualSection from "../components/AuthVisualSection";
import "../styles/Auth.css";

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
      // Forzar el cierre de sesión antes de redirigir para evitar que entre al dashboard
      await supabase.auth.signOut();
      alert("Contraseña actualizada correctamente. Por favor, inicia sesión con tu nueva contraseña.");
      navigate("/login");
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
                <h1>Actualizar Contraseña</h1>
                <p>Ingresa tu nueva contraseña para asegurar tu cuenta.</p>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="mb-3">
                  <label className="headline">Nueva Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <IconLockPassword size={20} stroke={1.5} />
                    </span>
                    <input
                      type="password"
                      className="form-control bg-light p-2"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="headline">Confirmar Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <IconLockPassword size={20} stroke={1.5} />
                    </span>
                    <input
                      type="password"
                      className="form-control bg-light p-2"
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
                  className="btn-submit w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? "Actualizando..." : "Actualizar Contraseña"}
                </button>
              </form>

              <div className="text-center mt-3">
                <Link
                  to="/login"
                  className="text-decoration-none small fw-medium d-flex align-items-center justify-content-center gap-2"
                >
                  <IconArrowLeft size={18} />
                  Cancelar y volver al login
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

