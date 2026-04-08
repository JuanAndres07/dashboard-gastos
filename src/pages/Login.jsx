import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { IconMail, IconLockPassword, IconChartPie } from "@tabler/icons-react";
import "../styles/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("supabase.auth.rememberMe") === "true";
  });
  const leftSectionRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!leftSectionRef.current) return;
    const { left, top, width, height } =
      leftSectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    leftSectionRef.current.style.setProperty("--mouse-x", `${x}%`);
    leftSectionRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Guardar preferencia para el customStorage
    localStorage.setItem("supabase.auth.rememberMe", rememberMe);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Error al iniciar sesión:", error.message);
    } else {
      console.log("Inicio de sesión exitoso");
    }
    setLoading(false);
  };

  return (
    <div className="container-fluid vh-100 login-container">
      <div className="row h-100">
        {/* Columna Izquierda: Espacio para imágenes/visuales */}
        <div
          ref={leftSectionRef}
          onMouseMove={handleMouseMove}
          className="col-lg-6 login-visual-section d-none d-lg-flex"
        >
          <div className="interactive-bg"></div>
          <div className="text-center p-5" style={{ zIndex: 2 }}>
            <img src="/Logo.png" alt="Logo" width={400} />
            <h1 className="display-5 mb-3">
              <span className="text-primary">Domina</span> tu dinero, <br />
              <span className="text-primary">Diseña</span> tu futuro
            </h1>
            <p className="lead text-secondary opacity-75">
              Gestionar tus gastos no tiene por qué ser complicado. <br />
              Una interfaz limpia para un control total.
            </p>
            <div className="feature-badge">
              <IconChartPie size={20} />
              <span>Analítica inteligente en tiempo real</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Login */}
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
                <h1>Bienvenido de nuevo</h1>
                <p>Ingrese sus credenciales para acceder a su cuenta.</p>
              </div>

              <form onSubmit={handleLogin}>
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

                <div className="mb-4">
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

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setRememberMe(checked);
                        localStorage.setItem(
                          "supabase.auth.rememberMe",
                          checked
                        );
                      }}
                    />
                    <label
                      className="form-check-label text-secondary fs-6"
                      htmlFor="rememberMe"
                    >
                      Recordarme
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none small fw-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn-submit w-100"
                  disabled={loading}
                >
                  {loading ? "Iniciando..." : "Iniciar Sesión"}
                </button>
              </form>

              <p className="mt-4 text-center text-secondary">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/register"
                  className="text-primary fw-semibold text-decoration-none"
                >
                  Regístrate
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
