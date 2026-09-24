import { CameraView } from "./CameraView";
import { FileUploadZone } from "./FileUploadZone";
import { SOURCE_MODES } from "../../utilities/scanConstants";
import { IconCamera, IconUpload, IconSparkles } from "@tabler/icons-react";

export function ReceiptCaptureView({
  sourceMode,
  setSourceMode,
  videoRef,
  canvasRef,
  cameraError,
  cameraReady,
  onLoadedMetadata,
  onToggleCamera,
  onCapture,
  onFileSelect,
  stopCamera,
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      {/* Selector de Modo */}
      <div className="flex bg-(--bg-light) p-1.5 rounded-2xl gap-1.5 border border-(--sidebar-border)">
        <button
          type="button"
          onClick={() => setSourceMode(SOURCE_MODES.CAMERA)}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            sourceMode === SOURCE_MODES.CAMERA
              ? "bg-(--primary-color) text-white shadow-sm"
              : "text-(--text-color) hover:text-(--headings-color)"
          }`}
        >
          <IconCamera size={18} />
          <span>Usar Cámara en Vivo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setSourceMode(SOURCE_MODES.UPLOAD);
          }}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            sourceMode === SOURCE_MODES.UPLOAD
              ? "bg-(--primary-color) text-white shadow-sm"
              : "text-(--text-color) hover:text-(--headings-color)"
          }`}
        >
          <IconUpload size={18} />
          <span>Subir Archivo / Arrastrar</span>
        </button>
      </div>

      {/* Área de Cámara o Dropzone */}
      {sourceMode === SOURCE_MODES.CAMERA && (
        <CameraView
          videoRef={videoRef}
          canvasRef={canvasRef}
          cameraError={cameraError}
          cameraReady={cameraReady}
          onLoadedMetadata={onLoadedMetadata}
          onToggleCamera={onToggleCamera}
          onCapture={onCapture}
          onSwitchToUpload={() => setSourceMode(SOURCE_MODES.UPLOAD)}
        />
      )}

      {sourceMode === SOURCE_MODES.UPLOAD && (
        <FileUploadZone onFileSelect={onFileSelect} />
      )}

      {/* Tips útiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-(--text-color)">
        <div className="p-3 bg-(--bg-light) rounded-xl border border-(--sidebar-border) flex items-start gap-2">
          <IconSparkles
            size={16}
            className="text-(--primary-color) shrink-0 mt-0.5"
          />
          <span>
            <strong>Buena luz:</strong> Evita reflejos y sombras sobre los
            números del ticket.
          </span>
        </div>
        <div className="p-3 bg-(--bg-light) rounded-xl border border-(--sidebar-border) flex items-start gap-2">
          <IconSparkles
            size={16}
            className="text-(--primary-color) shrink-0 mt-0.5"
          />
          <span>
            <strong>Encuadre plano:</strong> Coloca el recibo sobre una
            superficie plana y recta.
          </span>
        </div>
        <div className="p-3 bg-(--bg-light) rounded-xl border border-(--sidebar-border) flex items-start gap-2">
          <IconSparkles
            size={16}
            className="text-(--primary-color) shrink-0 mt-0.5"
          />
          <span>
            <strong>Auto-categoría:</strong> Detecta tus rubros de gastos
            automáticamente.
          </span>
        </div>
      </div>
    </div>
  );
}
