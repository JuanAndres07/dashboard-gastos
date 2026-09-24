import { useState } from "react";
import {
  IconZoomIn,
  IconZoomOut,
  IconRotateClockwise,
  IconRefresh,
} from "@tabler/icons-react";

export function ReceiptImageViewer({
  imageSrc,
  onResetImage,
  detectedStore,
  totalUSD,
  totalVES,
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="flex flex-col h-full bg-(--settings-card-bg) border border-(--sidebar-border) rounded-2xl overflow-hidden shadow-xs">
      {/* Barra superior de herramientas del visor */}
      <div className="p-3 border-b border-(--sidebar-border) bg-(--bg-light)/60 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-(--headings-color) flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Recibo Capturado
          </span>
          {detectedStore && (
            <span className="text-xs text-(--text-color) font-medium hidden sm:inline truncate max-w-37.5">
              • {detectedStore}
            </span>
          )}
        </div>

        {/* Controles de imagen */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.75}
            className="p-1.5 rounded-lg text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) disabled:opacity-40 transition-colors cursor-pointer"
            title="Reducir zoom"
          >
            <IconZoomOut size={16} />
          </button>
          <span className="text-[11px] font-mono font-medium text-(--text-color) w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-1.5 rounded-lg text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) disabled:opacity-40 transition-colors cursor-pointer"
            title="Aumentar zoom"
          >
            <IconZoomIn size={16} />
          </button>

          <div className="h-4 w-px bg-(--sidebar-border) mx-1"></div>

          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-lg text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) transition-colors cursor-pointer"
            title="Girar 90°"
          >
            <IconRotateClockwise size={16} />
          </button>

          {(zoom !== 1 || rotation !== 0) && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-[11px] text-(--primary-color) hover:underline px-1 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}

          <div className="h-4 w-px bg-(--sidebar-border) mx-1"></div>

          {/* Cambiar foto */}
          <button
            type="button"
            onClick={onResetImage}
            className="p-1.5 text-(--primary-color) hover:bg-(--primary-color)/10 rounded-lg transition-colors cursor-pointer"
            title="Escanear o subir otra foto"
          >
            <IconRefresh size={16} />
          </button>
        </div>
      </div>

      {/* Área del contenido de la imagen con Zoom y Rotación */}
      <div className="relative flex-1 min-h-95 max-h-150 overflow-auto bg-black/5 dark:bg-black/30 flex items-center justify-center p-4">
        <div className="relative transition-transform duration-200 ease-out flex items-center justify-center">
          <img
            src={imageSrc}
            alt="Recibo o Factura Escaneada"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
            }}
            className="max-h-130 w-auto max-w-full object-contain rounded-lg shadow-md select-none pointer-events-auto"
          />
        </div>
      </div>

      {/* Pie informativo de totales detectados */}
      {(totalUSD || totalVES) && (
        <div className="p-2.5 border-t border-(--sidebar-border) bg-(--bg-light)/40 flex items-center justify-between text-xs text-(--text-color) px-4">
          <span className="text-[11px] font-medium">
            Lectura de Totales OCR:
          </span>
          <div className="flex items-center gap-3">
            {totalUSD && (
              <span className="font-semibold text-(--headings-color)">
                USD: <span className="text-(--primary-color)">${totalUSD}</span>
              </span>
            )}
            {totalVES && (
              <span className="font-medium text-(--text-color)">
                Bs: <span className="font-semibold">{totalVES}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
