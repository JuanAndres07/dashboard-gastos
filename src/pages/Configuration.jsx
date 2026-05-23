import { useTheme } from "../contexts/ThemeContext";
import { IconSun, IconMoon, IconCheck } from "@tabler/icons-react";

export default function Configuration() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container py-4">
      <header className="mb-5">
        <h1 className="fw-bold mb-2">Configuración</h1>
        <p className="text-muted">Personaliza la apariencia y el comportamiento de tu panel de control.</p>
      </header>

      <div className="row">
        <div className="col-lg-8">
          {/* Card de Configuración de Tema */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-1">Apariencia</h5>
              <p className="text-muted small mb-4">
                Elige cómo deseas ver la interfaz de FinFlow en tu dispositivo.
              </p>

              <div className="row g-3">
                {/* Opción Tema Claro */}
                <div className="col-md-6">
                  <div
                    onClick={() => setTheme("light")}
                    className={`settings-card p-4 d-flex flex-column align-items-center text-center h-100 ${
                      theme === "light" ? "active" : ""
                    }`}
                  >
                    <div
                      className={`p-3 rounded-circle mb-3 ${
                        theme === "light"
                          ? "bg-primary-subtle text-primary"
                          : "bg-light text-secondary"
                      }`}
                      style={{ transition: "all 0.2s ease" }}
                    >
                      <IconSun size={32} stroke={1.5} />
                    </div>
                    <h6 className="fw-bold mb-1">Claro</h6>
                    <p className="text-muted small mb-3">
                      Ideal para ambientes muy iluminados.
                    </p>
                    {theme === "light" && (
                      <span className="badge bg-primary d-inline-flex align-items-center gap-1 py-2 px-3 rounded-pill">
                        <IconCheck size={14} stroke={2.5} /> Activo
                      </span>
                    )}
                  </div>
                </div>

                {/* Opción Tema Oscuro */}
                <div className="col-md-6">
                  <div
                    onClick={() => setTheme("dark")}
                    className={`settings-card p-4 d-flex flex-column align-items-center text-center h-100 ${
                      theme === "dark" ? "active" : ""
                    }`}
                  >
                    <div
                      className={`p-3 rounded-circle mb-3 ${
                        theme === "dark"
                          ? "bg-primary text-white"
                          : "bg-light text-secondary"
                      }`}
                      style={{ transition: "all 0.2s ease" }}
                    >
                      <IconMoon size={32} stroke={1.5} />
                    </div>
                    <h6 className="fw-bold mb-1">Oscuro</h6>
                    <p className="text-muted small mb-3">
                      Ideal para descansar la vista en ambientes oscuros.
                    </p>
                    {theme === "dark" && (
                      <span className="badge bg-primary d-inline-flex align-items-center gap-1 py-2 px-3 rounded-pill">
                        <IconCheck size={14} stroke={2.5} /> Activo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
