import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { IconSun, IconMoon, IconCheck, IconUser, IconMail, IconLock, IconKey, IconX } from "@tabler/icons-react";

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
    <div className="w-full space-y-6 text-left">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">
            Configuración
          </h1>
          <p className="text-sm text-(--text-color)/85 mt-1">
            Personaliza la apariencia y el comportamiento de tu panel de control.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Card de Configuración de Perfil */}
          <div
            className="flex-1 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
            style={{ border: "var(--card-border)" }}
          >
            <h2 className="text-lg font-bold text-(--headings-color) mb-1">
              Información de Perfil
            </h2>
            <p className="text-sm text-(--text-color)/85 mb-6">
              Actualiza tus datos personales para personalizar tu experiencia en la aplicación.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-(--text-color)/70">
                      <IconUser size={20} stroke={1.5} />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
                      placeholder="Tu nombre completo"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-(--text-color)/50">
                      <IconMail size={20} stroke={1.5} />
                    </span>
                    <input
                      type="email"
                      className="w-full pl-11 pr-4 py-3 bg-(--bg-light)/60 border border-(--sidebar-border) rounded-xl text-(--headings-color) text-sm opacity-60 cursor-not-allowed transition-all duration-300"
                      value={user?.email || ""}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-(--primary-color) text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] cursor-pointer text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <IconCheck size={18} stroke={2.5} />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {message.text && (
              <div
                className={`p-3 mt-4 rounded-xl border flex justify-between items-center transition-all duration-300 ${
                  message.type === "danger"
                    ? "bg-(--danger-color)/10 border-(--danger-color)/20 text-(--danger-color)"
                    : "bg-(--success-color)/10 border-(--success-color)/20 text-(--success-color)"
                }`}
              >
                <span className="text-xs font-semibold">{message.text}</span>
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-black/5 text-current transition-all duration-200 cursor-pointer"
                  onClick={() => setMessage({ type: "", text: "" })}
                  aria-label="Cerrar mensaje"
                >
                  <IconX size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Card de Cambiar Correo Electrónico */}
          <div
            className="flex-1 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
            style={{ border: "var(--card-border)" }}
          >
            <h2 className="text-lg font-bold text-(--headings-color) mb-1">
              Cambiar Correo Electrónico
            </h2>
            <p className="text-sm text-(--text-color)/85 mb-6">
              Actualiza tu dirección de correo electrónico. Se enviará un mensaje de confirmación para validar el cambio.
            </p>

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5">
                    Nuevo Correo Electrónico
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-(--text-color)/70">
                      <IconMail size={20} stroke={1.5} />
                    </span>
                    <input
                      type="email"
                      className="w-full pl-11 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
                      placeholder="nuevo@correo.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-(--text-color)/70">
                      <IconLock size={20} stroke={1.5} />
                    </span>
                    <input
                      type="password"
                      className="w-full pl-11 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
                      placeholder="Tu contraseña actual"
                      value={emailCurrentPassword}
                      onChange={(e) => setEmailCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-(--primary-color) text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] cursor-pointer text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSavingEmail}
                >
                  {isSavingEmail ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Actualizando Correo...</span>
                    </>
                  ) : (
                    <>
                      <IconCheck size={18} stroke={2.5} />
                      <span>Actualizar Correo</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {emailMessage.text && (
              <div
                className={`p-3 mt-4 rounded-xl border flex justify-between items-center transition-all duration-300 ${
                  emailMessage.type === "danger"
                    ? "bg-(--danger-color)/10 border-(--danger-color)/20 text-(--danger-color)"
                    : "bg-(--success-color)/10 border-(--success-color)/20 text-(--success-color)"
                }`}
              >
                <span className="text-xs font-semibold">{emailMessage.text}</span>
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-black/5 text-current transition-all duration-200 cursor-pointer"
                  onClick={() => setEmailMessage({ type: "", text: "" })}
                  aria-label="Cerrar mensaje"
                >
                  <IconX size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

          {/* Card de Cambiar Contraseña */}
          <div
            className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
            style={{ border: "var(--card-border)" }}
          >
            <h2 className="text-lg font-bold text-(--headings-color) mb-1">
              Cambiar Contraseña
            </h2>
            <p className="text-sm text-(--text-color)/85 mb-6">
              Actualiza tu contraseña para mantener tu cuenta segura.
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-(--text-color)/70">
                      <IconLock size={20} stroke={1.5} />
                    </span>
                    <input
                      type="password"
                      className="w-full pl-11 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
                      placeholder="Contraseña actual"
                      value={passwordCurrentPassword}
                      onChange={(e) => setPasswordCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-(--text-color)/70">
                      <IconKey size={20} stroke={1.5} />
                    </span>
                    <input
                      type="password"
                      className="w-full pl-11 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-(--text-color)/70">
                      <IconKey size={20} stroke={1.5} />
                    </span>
                    <input
                      type="password"
                      className="w-full pl-11 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
                      placeholder="Repite la nueva contraseña"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-(--primary-color) text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] cursor-pointer text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Actualizando Contraseña...</span>
                    </>
                  ) : (
                    <>
                      <IconCheck size={18} stroke={2.5} />
                      <span>Actualizar Contraseña</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {passwordMessage.text && (
              <div
                className={`p-3 mt-4 rounded-xl border flex justify-between items-center transition-all duration-300 ${
                  passwordMessage.type === "danger"
                    ? "bg-(--danger-color)/10 border-(--danger-color)/20 text-(--danger-color)"
                    : "bg-(--success-color)/10 border-(--success-color)/20 text-(--success-color)"
                }`}
              >
                <span className="text-xs font-semibold">{passwordMessage.text}</span>
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-black/5 text-current transition-all duration-200 cursor-pointer"
                  onClick={() => setPasswordMessage({ type: "", text: "" })}
                  aria-label="Cerrar mensaje"
                >
                  <IconX size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Card de Configuración de Tema */}
          <div
            className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
            style={{ border: "var(--card-border)" }}
          >
            <h2 className="text-lg font-bold text-(--headings-color) mb-1">
              Apariencia
            </h2>
            <p className="text-sm text-(--text-color)/85 mb-6">
              Elige cómo deseas ver la interfaz de FinFlow en tu dispositivo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Opción Tema Claro */}
              <div
                onClick={() => setTheme("light")}
                className={`settings-card flex-1 p-6 flex flex-col items-center text-center transition-all duration-300 ease-in-out ${
                  theme === "light" ? "active" : ""
                }`}
              >
                <div
                  className={`p-3.5 rounded-full mb-3 transition-all duration-300 ${
                    theme === "light"
                      ? "bg-(--primary-color)/10 text-(--primary-color)"
                      : "bg-(--bg-light) text-(--text-color)"
                  }`}
                >
                  <IconSun size={32} stroke={1.5} />
                </div>
                <h3 className="text-sm font-bold text-(--headings-color) mb-1">
                  Claro
                </h3>
                <p className="text-xs text-(--text-color)/80 mb-4">
                  Ideal para ambientes muy iluminados.
                </p>
                {theme === "light" ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-(--primary-color)/10 text-(--primary-color) text-xs font-semibold rounded-full">
                    <IconCheck size={14} stroke={2.5} /> Activo
                  </span>
                ) : (
                  <div className="h-6">{/* Placeholder to keep cards aligned */}</div>
                )}
              </div>

              {/* Opción Tema Oscuro */}
              <div
                onClick={() => setTheme("dark")}
                className={`settings-card flex-1 p-6 flex flex-col items-center text-center transition-all duration-300 ease-in-out ${
                  theme === "dark" ? "active" : ""
                }`}
              >
                <div
                  className={`p-3.5 rounded-full mb-3 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-(--primary-color)/20 text-(--primary-color)"
                      : "bg-(--bg-light) text-(--text-color)"
                  }`}
                >
                  <IconMoon size={32} stroke={1.5} />
                </div>
                <h3 className="text-sm font-bold text-(--headings-color) mb-1">
                  Oscuro
                </h3>
                <p className="text-xs text-(--text-color)/80 mb-4">
                  Ideal para descansar la vista en ambientes oscuros.
                </p>
                {theme === "dark" ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-(--primary-color)/10 text-(--primary-color) text-xs font-semibold rounded-full">
                    <IconCheck size={14} stroke={2.5} /> Activo
                  </span>
                ) : (
                  <div className="h-6">{/* Placeholder to keep cards aligned */}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
