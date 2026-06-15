import { createContext, useContext, useState, useRef } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconAlertOctagon,
} from "@tabler/icons-react";

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({
    title: "",
    message: "",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    type: "danger", // 'danger' | 'warning' | 'info'
  });

  const resolveRef = useRef(null);
  const isOpenRef = useRef(false);

  const confirm = (customOptions) => {
    if (isOpenRef.current) {
      return Promise.resolve(false);
    }
    isOpenRef.current = true;

    return new Promise((resolve) => {
      resolveRef.current = (value) => {
        isOpenRef.current = false;
        resolve(value);
        resolveRef.current = null;
      };
      setOptions({
        title: customOptions.title || "Confirmar",
        message: customOptions.message || "¿Estás seguro?",
        confirmText: customOptions.confirmText || "Confirmar",
        cancelText: customOptions.cancelText || "Cancelar",
        type: customOptions.type || "danger",
      });
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(true);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(false);
    }
  };

  // Select icon and colors based on type
  const getIcon = () => {
    switch (options.type) {
      case "warning":
        return <IconAlertOctagon className="w-6 h-6 text-amber-500" />;
      case "info":
        return <IconInfoCircle className="w-6 h-6 text-(--primary-color)" />;
      case "danger":
      default:
        return <IconAlertTriangle className="w-6 h-6 text-(--danger-color)" />;
    }
  };

  const getIconBg = () => {
    switch (options.type) {
      case "warning":
        return "bg-amber-500/10";
      case "info":
        return "bg-(--primary-color)/10";
      case "danger":
      default:
        return "bg-(--danger-color)/10";
    }
  };

  const getConfirmButtonClass = () => {
    switch (options.type) {
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500";
      case "info":
        return "bg-(--primary-color) hover:opacity-90 text-white focus:ring-(--primary-color)";
      case "danger":
      default:
        return "bg-(--danger-color) hover:opacity-90 text-white focus:ring-(--danger-color)";
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <Dialog
        open={isOpen}
        onClose={handleCancel}
        className="relative z-1200"
        transition
      >
        {/* Backdrop difuminado con animación */}
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out data-closed:opacity-0"
        />

        {/* Contenedor del Modal */}
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative w-full max-w-md bg-(--settings-card-bg) rounded-2xl p-6 shadow-2xl transition-all duration-300 ease-out data-closed:scale-95 data-closed:opacity-0 border border-(--sidebar-border)"
            style={{ border: "var(--card-border)" }}
          >
            <div className="flex items-start gap-4">
              {/* Icono decorativo */}
              <div
                className={`p-3 rounded-xl shrink-0 ${getIconBg()} flex items-center justify-center w-12 h-12`}
              >
                {getIcon()}
              </div>

              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-bold text-(--headings-color) mb-1 leading-snug">
                  {options.title}
                </DialogTitle>
                <p className="text-sm text-(--text-color) font-medium leading-relaxed">
                  {options.message}
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-sm transition-all duration-300 cursor-pointer min-w-25 text-center"
              >
                {options.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2.5 font-semibold rounded-xl text-sm transition-all duration-300 active:scale-[0.99] cursor-pointer min-w-25 text-center ${getConfirmButtonClass()}`}
              >
                {options.confirmText}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm debe usarse dentro de un ConfirmProvider");
  }
  return context;
}
