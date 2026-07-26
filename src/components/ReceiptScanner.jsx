import { useState } from "react";
import Modal from "./Modal";
import { useCamera } from "../hooks/useCamera";
import { useReceiptOCR } from "../hooks/useReceiptOCR";
import { CameraView } from "./receipt-scanner/CameraView";
import { FileUploadZone } from "./receipt-scanner/FileUploadZone";
import { ScanProgressBar } from "./receipt-scanner/ScanProgressBar";
import { IconCamera, IconUpload, IconRefresh, IconScan } from "@tabler/icons-react";

export default function ReceiptScanner({ isOpen, onClose, onScanComplete }) {
  const [sourceMode, setSourceMode] = useState("camera"); // 'camera' | 'upload'
  const [imageSrc, setImageSrc] = useState(null);

  const { isScanning, progress, statusText, processReceipt, resetOCR } = useReceiptOCR();

  const {
    videoRef,
    canvasRef,
    cameraError,
    stopCamera,
    startCamera,
    toggleFacingMode,
    capturePhoto,
  } = useCamera({
    isActive: isOpen && sourceMode === "camera" && !imageSrc,
    onCapture: (dataUrl) => setImageSrc(dataUrl),
  });

  const handleClose = () => {
    stopCamera();
    setImageSrc(null);
    resetOCR();
    onClose();
  };

  const handleProcess = () => {
    processReceipt(imageSrc, (extracted) => {
      handleClose();
      if (onScanComplete) {
        onScanComplete(extracted);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Escanear Factura / Recibo" maxWidth="max-w-lg">
      <div className="space-y-4 text-left">
        {/* Selector de modo: Cámara vs Subir Archivo */}
        {!imageSrc && !isScanning && (
          <div className="flex bg-(--bg-light) p-1 rounded-xl gap-1 mb-4">
            <button
              type="button"
              onClick={() => setSourceMode("camera")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                sourceMode === "camera"
                  ? "bg-(--primary-color) text-white shadow-sm"
                  : "text-(--text-color) hover:text-(--headings-color)"
              }`}
            >
              <IconCamera size={16} />
              <span>Usar Cámara</span>
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setSourceMode("upload");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                sourceMode === "upload"
                  ? "bg-(--primary-color) text-white shadow-sm"
                  : "text-(--text-color) hover:text-(--headings-color)"
              }`}
            >
              <IconUpload size={16} />
              <span>Subir Archivo</span>
            </button>
          </div>
        )}

        {/* Visor de Cámara */}
        {!imageSrc && sourceMode === "camera" && (
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            cameraError={cameraError}
            onToggleCamera={toggleFacingMode}
            onCapture={capturePhoto}
            onSwitchToUpload={() => setSourceMode("upload")}
          />
        )}

        {/* Carga de Archivo */}
        {!imageSrc && sourceMode === "upload" && (
          <FileUploadZone onFileSelect={(src) => setImageSrc(src)} />
        )}

        {/* Vista previa de la foto capturada o cargada */}
        {imageSrc && (
          <div className="space-y-4">
            <div className="relative w-full max-h-72 bg-black/5 rounded-2xl overflow-hidden border border-(--sidebar-border) flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Vista previa de factura"
                className="max-h-72 w-auto object-contain"
              />
              {!isScanning && (
                <button
                  onClick={() => {
                    setImageSrc(null);
                    if (sourceMode === "camera") {
                      startCamera();
                    }
                  }}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer backdrop-blur-xs"
                  title="Volver a tomar foto"
                >
                  <IconRefresh size={18} />
                </button>
              )}
            </div>

            {/* Progreso de OCR */}
            {isScanning && <ScanProgressBar progress={progress} statusText={statusText} />}

            {/* Acciones */}
            {!isScanning && (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setImageSrc(null);
                    if (sourceMode === "camera") {
                      startCamera();
                    }
                  }}
                  className="flex-1 py-3 px-4 bg-(--bg-light) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer text-center"
                >
                  Cambiar Imagen
                </button>
                <button
                  type="button"
                  onClick={handleProcess}
                  className="flex-1 py-3 px-4 bg-(--primary-color) text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99] shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IconScan size={18} />
                  <span>Procesar Factura</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
