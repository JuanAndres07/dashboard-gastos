import { ScanProgressBar } from "./ScanProgressBar";
import { IconReceipt } from "@tabler/icons-react";

export function ReceiptProcessingView({ progress, statusText, onCancel }) {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-5 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-3xl p-8 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-(--primary-color)/10 text-(--primary-color) flex items-center justify-center mx-auto animate-pulse">
        <IconReceipt size={32} />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-(--headings-color)">
          Procesando comprobante...
        </h3>
        <p className="text-xs text-(--text-color)">
          Reconociendo comercio, productos, cantidades y totales fiscales.
        </p>
      </div>

      <ScanProgressBar progress={progress} statusText={statusText} />

      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 bg-(--bg-light) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) text-xs font-semibold rounded-xl transition-all cursor-pointer"
      >
        Cancelar Proceso
      </button>
    </div>
  );
}
