import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { IconUser, IconMail, IconLock, IconKey, IconX, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import DangerZone from "../components/DangerZone";
import Modal from "../components/Modal";
import { toast } from "sonner";
import { translateSupabaseError } from "../utilities/supabaseErrors";

export default function Configuration() {
  const { user, profile, updateProfile, changeEmail, cancelEmailChange, changePassword } = useAuth();
  
  const [fullname, setFullname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Estados para Cambiar Correo Electrónico
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isCancellingEmail, setIsCancellingEmail] = useState(false);

  // Estados para Cambiar Contraseña
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Estados para Modales
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
      setMessage({ type: "danger", text: "Error al actualizar el perfil: " + translateSupabaseError(error) });
    } else {
      setMessage({ type: "success", text: "¡Perfil actualizado con éxito!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
    setIsSaving(false);
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setIsSavingEmail(true);
    setIsEmailModalOpen(false); // Cerrar modal automáticamente

    const { error } = await changeEmail(emailCurrentPassword, newEmail);

    if (error) {
      const errorMsg = error.code === "invalid_credentials" || error.message?.toLowerCase().includes("invalid credentials")
        ? "La contraseña actual es incorrecta."
        : translateSupabaseError(error);
      toast.error("Error al actualizar el correo: " + errorMsg);
    } else {
      toast.success("¡Se ha enviado un correo de confirmación a ambas direcciones!");
      setNewEmail("");
      setEmailCurrentPassword("");
    }
    setIsSavingEmail(false);
  };

  const handleCancelEmailChange = async () => {
    setIsCancellingEmail(true);
    const { error } = await cancelEmailChange();
    if (error) {
      toast.error("Error al cancelar la solicitud: " + translateSupabaseError(error));
    } else {
      toast.success("Solicitud de cambio de correo cancelada.");
    }
    setIsCancellingEmail(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("Las nuevas contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSavingPassword(true);
    setIsPasswordModalOpen(false); // Cerrar modal automáticamente

    const { error } = await changePassword(passwordCurrentPassword, newPassword);

    if (error) {
      const errorMsg = error.code === "invalid_credentials" || error.message?.toLowerCase().includes("invalid credentials")
        ? "La contraseña actual es incorrecta."
        : translateSupabaseError(error);
      toast.error("Error al actualizar la contraseña: " + errorMsg);
    } else {
      toast.success("¡Contraseña actualizada con éxito!");
      setPasswordCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
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
        {/* Card de Configuración de Perfil */}
        <div
          className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
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
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider">
                    Correo Electrónico
                  </label>
                  {user?.new_email && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Cambio pendiente
                    </span>
                  )}
                </div>
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
                {user?.new_email && (
                  <div className="p-4 mt-2 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
                        <IconAlertTriangle size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-(--headings-color)">
                          Confirmación de cambio de correo requerida
                        </h4>
                        <p className="text-xs text-(--text-color)/90">
                          Has solicitado cambiar tu correo a <strong className="text-amber-600 dark:text-amber-400 font-semibold">{user.new_email}</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="pl-8 text-xs text-(--text-color)/85 space-y-2">
                      <p>
                        Para completar el cambio, por favor haz clic en los enlaces de confirmación que hemos enviado a:
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <div className="p-2.5 bg-(--bg-light) border border-(--sidebar-border) rounded-lg flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <div className="min-w-0">
                            <span className="block text-[10px] uppercase font-bold text-(--text-color)/70">Correo actual</span>
                            <span className="block font-semibold text-(--headings-color) truncate text-xs">{user.email}</span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-(--bg-light) border border-(--sidebar-border) rounded-lg flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <div className="min-w-0">
                            <span className="block text-[10px] uppercase font-bold text-(--text-color)/70">Nuevo correo</span>
                            <span className="block font-semibold text-(--headings-color) truncate text-xs">{user.new_email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={handleCancelEmailChange}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold rounded-xl text-xs transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                          disabled={isCancellingEmail}
                        >
                          {isCancellingEmail ? (
                            <>
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                              <span>Cancelando...</span>
                            </>
                          ) : (
                            <span>Cancelar solicitud</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
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

              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="flex items-center gap-2 bg-(--bg-light) border border-(--sidebar-border) text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out active:scale-[0.99] cursor-pointer text-sm shrink-0"
              >
                <IconMail size={18} stroke={1.5} />
                <span>Cambiar Correo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center gap-2 bg-(--bg-light) border border-(--sidebar-border) text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out active:scale-[0.99] cursor-pointer text-sm shrink-0"
              >
                <IconLock size={18} stroke={1.5} />
                <span>Cambiar Contraseña</span>
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

        <DangerZone />

        {/* Modal para Cambiar Correo Electrónico */}
        <Modal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          title="Cambiar Correo Electrónico"
        >
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <p className="text-sm text-(--text-color)/85 mb-4">
              Actualiza tu dirección de correo electrónico. Se enviará un mensaje de confirmación para validar el cambio.
            </p>

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

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="flex-1 py-2.5 border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-sm transition-all duration-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-(--primary-color) text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-[0_4px_12px_rgba(0,82,204,0.15)]"
                disabled={isSavingEmail}
              >
                {isSavingEmail ? "Actualizando..." : "Actualizar Correo"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal para Cambiar Contraseña */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title="Cambiar Contraseña"
        >
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <p className="text-sm text-(--text-color)/85 mb-4">
              Actualiza tu contraseña para mantener tu cuenta segura.
            </p>

            <div className="flex flex-col gap-4">
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
                    placeholder="Contraseña actual"
                    value={passwordCurrentPassword}
                    onChange={(e) => setPasswordCurrentPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
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

              <div className="flex flex-col gap-1.5">
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

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex-1 py-2.5 border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-sm transition-all duration-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-(--primary-color) text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-[0_4px_12px_rgba(0,82,204,0.15)]"
                disabled={isSavingPassword}
              >
                {isSavingPassword ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
