import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { IconTrash, IconAlertTriangle, IconLock, IconX } from "@tabler/icons-react";
import Modal from "./Modal";
import { translateSupabaseError } from "../utilities/supabaseErrors";

export default function DangerZone() {
  const { deleteAccount } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountMessage, setDeleteAccountMessage] = useState({ type: "", text: "" });

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmPassword("");
    setDeleteAccountMessage({ type: "", text: "" });
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setIsDeletingAccount(true);
    setDeleteAccountMessage({ type: "", text: "" });

    const { error } = await deleteAccount(deleteConfirmPassword);

    if (error) {
      setDeleteAccountMessage({ type: "danger", text: "Error al eliminar la cuenta: " + translateSupabaseError(error) });
    } else {
      handleCloseDeleteModal();
    }
    setIsDeletingAccount(false);
  };

  return (
    <>
      {/* Card de Eliminar Cuenta */}
      <div
        className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
        style={{ border: "var(--card-border)" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-(--danger-color) mb-1 flex items-center gap-2">
              <IconTrash size={22} stroke={1.5} />
              <span>Eliminar Cuenta</span>
            </h2>
            <p className="text-sm text-(--text-color)/85">
              Esta acción es destructiva e irreversible. Se borrarán permanentemente todos tus datos de transacciones, presupuestos, categorías y suscripciones.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 bg-(--danger-color) text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(239,68,68,0.15)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.25)] cursor-pointer text-sm shrink-0"
          >
            <IconTrash size={18} stroke={2} />
            <span>Eliminar mi cuenta</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmación para Eliminar Cuenta */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="¿Estás seguro de que deseas eliminar tu cuenta?"
      >
        <div className="space-y-4">
          <div className="p-3 bg-(--danger-color)/10 border border-(--danger-color)/20 text-(--danger-color) text-xs rounded-xl flex items-start gap-2.5">
            <IconAlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div>
              <span className="font-bold block mb-0.5">Advertencia: Esta acción no se puede deshacer</span>
              Al confirmar la eliminación, perderás el acceso a la plataforma y todos tus datos financieros serán borrados de forma permanente.
            </div>
          </div>

          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5">
                Introduce tu contraseña para confirmar
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-(--text-color)/70">
                  <IconLock size={20} stroke={1.5} />
                </span>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--danger-color) focus:border-transparent transition-all duration-300"
                  placeholder="Tu contraseña actual"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {deleteAccountMessage.text && (
              <div
                className={`p-3 rounded-xl border flex justify-between items-center transition-all duration-300 bg-(--danger-color)/10 border-(--danger-color)/20 text-(--danger-color)`}
              >
                <span className="text-xs font-semibold">{deleteAccountMessage.text}</span>
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-black/5 text-current transition-all duration-200 cursor-pointer"
                  onClick={() => setDeleteAccountMessage({ type: "", text: "" })}
                  aria-label="Cerrar mensaje"
                >
                  <IconX size={14} />
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="flex-1 py-2.5 px-4 bg-(--bg-light) text-(--headings-color) border border-(--sidebar-border) font-semibold rounded-xl hover:bg-(--sidebar-link-hover-bg) active:scale-[0.99] transition-all duration-200 cursor-pointer text-sm text-center"
                disabled={isDeletingAccount}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-(--danger-color) text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(239,68,68,0.15)] cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <IconTrash size={16} stroke={2} />
                    <span>Eliminar Cuenta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
