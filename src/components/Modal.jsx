import { IconX } from "@tabler/icons-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1100 flex items-center justify-center p-4">
      {/* Backdrop difuminado */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      ></div>

      {/* Tarjeta del Modal */}
      <div
        className={`relative w-full ${maxWidth} bg-(--settings-card-bg) rounded-2xl p-6 shadow-2xl transition-all duration-300 ease-in-out transform scale-100`}
        style={{ border: "var(--card-border)" }}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-(--headings-color)">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-(--text-color) hover:bg-(--sidebar-link-hover-bg) hover:text-(--headings-color) transition-all duration-200 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <IconX size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
