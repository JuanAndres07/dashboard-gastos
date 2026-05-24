import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { IconSun, IconMoon, IconCheck, IconUser, IconMail, IconLock, IconKey } from "@tabler/icons-react";

export default function Configuration() {
  const { theme, setTheme } = useTheme();
  const { user, profile, updateProfile, changeEmail, changePassword } = useAuth();
  
  const [fullname, setFullname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Estados para Cambiar Correo Electrónico
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ type: "", text: "" });

  // Estados para Cambiar Contraseña
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (profile?.fullname) {
      setFullname(profile.fullname);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const { error } = await updateProfile({ fullname });

    if (error) {
      setMessage({ type: "danger", text: "Error al actualizar el perfil: " + error.message });
    } else {
      setMessage({ type: "success", text: "¡Perfil actualizado con éxito!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
    setIsSaving(false);
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setIsSavingEmail(true);
    setEmailMessage({ type: "", text: "" });

    const { error } = await changeEmail(emailCurrentPassword, newEmail);

    if (error) {
      setEmailMessage({ type: "danger", text: "Error al actualizar el correo: " + error.message });
    } else {
      setEmailMessage({ type: "success", text: "¡Se ha enviado un correo de confirmación a ambas direcciones!" });
      setNewEmail("");
      setEmailCurrentPassword("");
      setTimeout(() => setEmailMessage({ type: "", text: "" }), 5000);
    }
    setIsSavingEmail(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordMessage({ type: "", text: "" });

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: "danger", text: "Las nuevas contraseñas no coinciden." });
      setIsSavingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "danger", text: "La nueva contraseña debe tener al menos 6 caracteres." });
      setIsSavingPassword(false);
      return;
    }

    const { error } = await changePassword(passwordCurrentPassword, newPassword);

    if (error) {
      setPasswordMessage({ type: "danger", text: "Error al actualizar la contraseña: " + error.message });
    } else {
      setPasswordMessage({ type: "success", text: "¡Contraseña actualizada con éxito!" });
      setPasswordCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setPasswordMessage({ type: "", text: "" }), 5000);
    }
    setIsSavingPassword(false);
  };

  return (
    <div className="container py-4">
      <header className="mb-5">
        <h1 className="fw-bold mb-2">Configuración</h1>
        <p className="text-muted">Personaliza la apariencia y el comportamiento de tu panel de control.</p>
      </header>

      <div className="row">
        <div className="col-lg-8">
          {/* Card de Configuración de Perfil */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-1">Información de Perfil</h5>
              <p className="text-muted small mb-4">
                Actualiza tus datos personales para personalizar tu experiencia en la aplicación.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Nombre Completo</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <IconUser size={20} stroke={1.5} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-start-0 ps-0"
                        placeholder="Tu nombre completo"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Correo Electrónico</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 opacity-75">
                        <IconMail size={20} stroke={1.5} className="text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control bg-light border-start-0 ps-0 opacity-75"
                        value={user?.email || ""}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
                      disabled={isSaving}
                      style={{ transition: "all 0.2s ease" }}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <IconCheck size={18} stroke={2.5} />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {message.text && (
                <div className={`alert alert-${message.type} mt-3 mb-0 d-flex align-items-center gap-2 py-2 px-3 border-0 shadow-sm`} role="alert" style={{ transition: "all 0.3s ease" }}>
                  <small className="fw-semibold">{message.text}</small>
                </div>
              )}
            </div>
          </div>

          {/* Card de Cambiar Correo Electrónico */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-1">Cambiar Correo Electrónico</h5>
              <p className="text-muted small mb-4">
                Actualiza tu dirección de correo electrónico. Se enviará un mensaje de confirmación para validar el cambio.
              </p>

              <form onSubmit={handleUpdateEmail}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Nuevo Correo Electrónico</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <IconMail size={20} stroke={1.5} className="text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control bg-light border-start-0 ps-0"
                        placeholder="nuevo@correo.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Contraseña Actual</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <IconLock size={20} stroke={1.5} className="text-muted" />
                      </span>
                      <input
                        type="password"
                        className="form-control bg-light border-start-0 ps-0"
                        placeholder="Tu contraseña actual"
                        value={emailCurrentPassword}
                        onChange={(e) => setEmailCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
                      disabled={isSavingEmail}
                      style={{ transition: "all 0.2s ease" }}
                    >
                      {isSavingEmail ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Actualizando Correo...
                        </>
                      ) : (
                        <>
                          <IconCheck size={18} stroke={2.5} />
                          Actualizar Correo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {emailMessage.text && (
                <div className={`alert alert-${emailMessage.type} mt-3 mb-0 d-flex align-items-center gap-2 py-2 px-3 border-0 shadow-sm`} role="alert" style={{ transition: "all 0.3s ease" }}>
                  <small className="fw-semibold">{emailMessage.text}</small>
                </div>
              )}
            </div>
          </div>

          {/* Card de Cambiar Contraseña */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-1">Cambiar Contraseña</h5>
              <p className="text-muted small mb-4">
                Actualiza tu contraseña para mantener tu cuenta segura.
              </p>

              <form onSubmit={handleUpdatePassword}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small text-secondary">Contraseña Actual</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <IconLock size={20} stroke={1.5} className="text-muted" />
                      </span>
                      <input
                        type="password"
                        className="form-control bg-light border-start-0 ps-0"
                        placeholder="Contraseña actual"
                        value={passwordCurrentPassword}
                        onChange={(e) => setPasswordCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold small text-secondary">Nueva Contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <IconKey size={20} stroke={1.5} className="text-muted" />
                      </span>
                      <input
                        type="password"
                        className="form-control bg-light border-start-0 ps-0"
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold small text-secondary">Confirmar Nueva Contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <IconKey size={20} stroke={1.5} className="text-muted" />
                      </span>
                      <input
                        type="password"
                        className="form-control bg-light border-start-0 ps-0"
                        placeholder="Repite la nueva contraseña"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
                      disabled={isSavingPassword}
                      style={{ transition: "all 0.2s ease" }}
                    >
                      {isSavingPassword ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Actualizando Contraseña...
                        </>
                      ) : (
                        <>
                          <IconCheck size={18} stroke={2.5} />
                          Actualizar Contraseña
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {passwordMessage.text && (
                <div className={`alert alert-${passwordMessage.type} mt-3 mb-0 d-flex align-items-center gap-2 py-2 px-3 border-0 shadow-sm`} role="alert" style={{ transition: "all 0.3s ease" }}>
                  <small className="fw-semibold">{passwordMessage.text}</small>
                </div>
              )}
            </div>
          </div>

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
