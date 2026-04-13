import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  IconMail,
  IconLockPassword,
  IconUser,
  IconChartPie,
} from "@tabler/icons-react";
import AuthVisualSection from "../components/AuthVisualSection";
import "../styles/Auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
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

      // Manejo específico de usuario ya registrado
      if (
        error.status === 400 ||
        error.message.includes("already registered")
      ) {
        alert(
          "Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión.",
        );
      } else {
        alert("Error al registrar: " + error.message);
      }
    } else {
      // Nota: Si la confirmación de email está activa en Supabase,
      // data.user puede ser nulo o la sesión nula hasta que se confirme.
      if (data?.user?.identities?.length === 0) {
        alert(
          "Este correo ya está registrado. Por favor, intenta iniciar sesión.",
        );
      } else {
        navigate("/confirm-email");
      }
    }
    setLoading(false);
  };

  return (
    <div className="container-fluid vh-100 auth-container">
      <div className="row h-100">
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
        <div className="col-lg-6 d-flex flex-column align-items-center h-100 p-4">
          <div className="flex-grow-1 d-flex flex-column justify-content-center w-100 align-items-center">
            <div className="form-wrapper">
              <div className="mb-4 d-flex flex-column align-items-center">
                <img
                  src="/Icon.png"
                  alt="Icono"
                  width={80}
                  className="mb-3 d-lg-none"
                />
                <h1>Crea tu cuenta</h1>
                <p>Completa los siguientes datos para comenzar.</p>
              </div>

              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="headline">Nombre Completo</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <IconUser size={20} stroke={1.5} />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light p-2"
                      placeholder="Juan Pérez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
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

                <div className="mb-3">
                  <label className="headline">Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <IconLockPassword size={20} stroke={1.5} />
                    </span>
                    <input
                      type="password"
                      className="form-control bg-light p-2"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-submit w-100"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Registrarse"}
                </button>
              </form>

              <p className="mt-4 text-center text-secondary">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-primary fw-semibold text-decoration-none"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>

          <p className="footer-text">Todos los derechos reservados © 2026</p>
        </div>
      </div>
    </div>
  );
}
