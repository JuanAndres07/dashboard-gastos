import { useState } from "react";
import Modal from "./Modal";
import { useCamera } from "../hooks/useCamera";
import { useReceiptOCR } from "../hooks/useReceiptOCR";
import { useCategories } from "../hooks/useCategories";
import { CameraView } from "./receipt-scanner/CameraView";
import { FileUploadZone } from "./receipt-scanner/FileUploadZone";
import { ScanProgressBar } from "./receipt-scanner/ScanProgressBar";
import { ReceiptItemsTable } from "./receipt-scanner/ReceiptItemsTable";
import {
  IconCamera,
  IconUpload,
  IconRefresh,
  IconCheck,
  IconAlertCircle,
  IconPhoto,
  IconCoins,
  IconFileText,
} from "@tabler/icons-react";

export default function ReceiptScanner({ isOpen, onClose, onScanComplete, user }) {
  const [sourceMode, setSourceMode] = useState("camera"); // 'camera' | 'upload'
  const [imageSrc, setImageSrc] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [saveMode, setSaveMode] = useState("single"); // 'single' | 'multiple'
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD"); // 'USD' | 'VES'

  const { categories } = useCategories(user);
  const { isScanning, progress, statusText, errorText, processReceipt, resetOCR, cancelOCR } = useReceiptOCR();

  const handleImageSelected = (dataUrl) => {
    setImageSrc(dataUrl);
    processReceipt(dataUrl, (extracted) => {
      setParsedData(extracted);
      setScannedItems(extracted.items || []);
      if (extracted.totalUSD) {
        setSelectedCurrency("USD");
      } else if (extracted.totalVES) {
        setSelectedCurrency("VES");
      }
    });
  };

  const {
    videoRef,
    canvasRef,
    cameraError,
    stopCamera,
    startCamera,
    toggleFacingMode,
    capturePhoto,
  } = useCamera({
    isActive: isOpen && sourceMode === "camera" && !imageSrc && !isScanning,
    onCapture: handleImageSelected,
  });

  const handleResetAll = () => {
    setImageSrc(null);
    setParsedData(null);
    setScannedItems([]);
    setSaveMode("single");
    setShowPhotoPreview(false);
    setShowRawText(false);
    setSelectedCurrency("USD");
    resetOCR();
  };

  const handleClose = () => {
    stopCamera();
    handleResetAll();
    onClose();
  };

  const handleConfirmSave = () => {
    if (!parsedData && scannedItems.length === 0) return;

    // Calcular suma de items actuales
    const sumItems = scannedItems.reduce((acc, item) => {
      const val = parseFloat(item.amount);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    const finalAmount =
      sumItems > 0
        ? sumItems.toFixed(2)
        : parsedData?.amount || "0.00";

    if (onScanComplete) {
      onScanComplete({
        amount: finalAmount,
        description: parsedData?.description || "Gasto escaneado",
        date: parsedData?.date || new Date().toISOString().split("T")[0],
        items: scannedItems,
        saveMode,
        subtotal: parsedData?.subtotal,
        taxAmount: parsedData?.taxAmount,
        currency: selectedCurrency,
        rawText: parsedData?.rawText || "",
      });
    }

    handleClose();
  };

  // Ajustar la suma de productos al total fiscal detectado
  const handleFixTotalWithItem = () => {
    if (!parsedData?.amount) return;
    const targetTotal = parseFloat(parsedData.amount);
    const sumItems = scannedItems.reduce((acc, item) => {
      const val = parseFloat(item.amount);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    const diff = targetTotal - sumItems;
    if (Math.abs(diff) > 0.01) {
      const diffItem = {
        id: Math.random().toString(36).substring(2, 9),
        description: diff > 0 ? "IVA / Impuestos o ajuste" : "Descuento / Ajuste",
        amount: Math.abs(diff).toFixed(2),
        categoryId: "",
      };
      setScannedItems([...scannedItems, diffItem]);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Escanear Factura / Recibo" maxWidth="max-w-3xl">
      <div className="space-y-4 text-left">
        {/* Vista 1: Selector y captura de imagen */}
        {!imageSrc && !isScanning && (
          <div className="max-w-md mx-auto">
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

            {sourceMode === "camera" && (
              <CameraView
                videoRef={videoRef}
                canvasRef={canvasRef}
                cameraError={cameraError}
                onToggleCamera={toggleFacingMode}
                onCapture={capturePhoto}
                onSwitchToUpload={() => setSourceMode("upload")}
              />
            )}

            {sourceMode === "upload" && (
              <FileUploadZone onFileSelect={handleImageSelected} />
            )}
          </div>
        )}

        {/* Vista 2: Procesamiento OCR */}
        {isScanning && (
          <div className="py-6 space-y-4">
            <ScanProgressBar progress={progress} statusText={statusText} />
            <p className="text-xs text-center text-(--text-color)">
              Leyendo productos, precios y totales del recibo...
            </p>
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  cancelOCR();
                  handleResetAll();
                }}
                className="px-4 py-2 bg-(--bg-light) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) text-xs font-medium rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Vista 3: Resultados y Tabla de Productos */}
        {!isScanning && imageSrc && (
          <div className="space-y-4">
            {/* Barra superior de control */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-(--bg-light) p-2.5 rounded-xl border border-(--sidebar-border)">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-(--headings-color)">
                  {scannedItems.length > 0
                    ? `${scannedItems.length} producto${scannedItems.length > 1 ? "s" : ""} detectado${scannedItems.length > 1 ? "s" : ""}`
                    : "Factura escaneada"}
                </span>
                {parsedData?.description && (
                  <span className="text-xs text-(--text-color) font-normal hidden sm:inline">
                    • {parsedData.description}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Selector de Moneda Dual si hay Bs y USD */}
                {parsedData?.totalUSD && parsedData?.totalVES && (
                  <div className="flex items-center bg-(--settings-card-bg) border border-(--sidebar-border) rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedCurrency("USD")}
                      className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        selectedCurrency === "USD"
                          ? "bg-(--primary-color) text-white"
                          : "text-(--text-color)"
                      }`}
                    >
                      USD (${parsedData.totalUSD})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCurrency("VES")}
                      className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        selectedCurrency === "VES"
                          ? "bg-(--primary-color) text-white"
                          : "text-(--text-color)"
                      }`}
                    >
                      Bs. ({parsedData.totalVES})
                    </button>
                  </div>
                )}

                {/* Botón Ver Texto OCR */}
                <button
                  type="button"
                  onClick={() => setShowRawText(!showRawText)}
                  className="px-2.5 py-1.5 bg-(--settings-card-bg) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) border border-(--sidebar-border) rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Ver texto crudo detectado por OCR"
                >
                  <IconFileText size={14} />
                  <span>{showRawText ? "Ocultar Texto" : "Texto OCR"}</span>
                </button>

                {/* Previsualizar foto */}
                <button
                  type="button"
                  onClick={() => setShowPhotoPreview(!showPhotoPreview)}
                  className="px-2.5 py-1.5 bg-(--settings-card-bg) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) border border-(--sidebar-border) rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  title={showPhotoPreview ? "Ocultar foto" : "Ver foto"}
                >
                  <IconPhoto size={14} />
                  <span>{showPhotoPreview ? "Ocultar" : "Foto"}</span>
                </button>

                {/* Tomar o subir otra foto */}
                <button
                  type="button"
                  onClick={() => {
                    handleResetAll();
                    if (sourceMode === "camera") {
                      startCamera();
                    }
                  }}
                  className="px-3 py-1.5 bg-(--primary-color)/10 hover:bg-(--primary-color)/20 text-(--primary-color) border border-(--primary-color)/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <IconRefresh size={14} />
                  <span>Otra foto</span>
                </button>
              </div>
            </div>

            {/* Vista previa colapsable de la foto */}
            {showPhotoPreview && (
              <div className="relative w-full max-h-48 bg-black/5 rounded-xl overflow-hidden border border-(--sidebar-border) flex items-center justify-center p-2">
                <img
                  src={imageSrc}
                  alt="Foto de factura"
                  className="max-h-44 w-auto object-contain rounded-lg shadow-xs"
                />
              </div>
            )}

            {/* Vista previa colapsable del texto OCR crudo */}
            {showRawText && (
              <div className="p-3 bg-(--bg-light) rounded-xl border border-(--sidebar-border) space-y-1">
                <div className="text-[11px] font-semibold text-(--text-color)/80 uppercase tracking-wider">
                  Texto leído directamente por el OCR:
                </div>
                <pre className="text-xs text-(--text-color) whitespace-pre-wrap max-h-40 overflow-y-auto bg-(--settings-card-bg) p-2.5 rounded-lg border border-(--sidebar-border) font-mono">
                  {parsedData?.rawText || "No hay texto disponible."}
                </pre>
              </div>
            )}

            {/* Advertencia si hubo error de lectura */}
            {errorText && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
                <IconAlertCircle size={16} className="shrink-0 text-amber-500" />
                <span>{errorText}</span>
              </div>
            )}

            {/* Banner de Discrepancia entre Suma de Productos y Total del Ticket */}
            {parsedData?.hasDiscrepancy && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-200 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <IconCoins size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>
                    Total de factura detectado: <strong>${parsedData.amount}</strong>. Suma de productos: <strong>${scannedItems.reduce((a, b) => a + (parseFloat(b.amount) || 0), 0).toFixed(2)}</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFixTotalWithItem}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer shadow-2xs"
                >
                  Añadir diferencia como IVA/Ajuste
                </button>
              </div>
            )}

            {/* Tabla de Productos */}
            <ReceiptItemsTable
              items={scannedItems}
              onItemsChange={setScannedItems}
              saveMode={saveMode}
              onSaveModeChange={setSaveMode}
              categories={categories}
              subtotal={parsedData?.subtotal}
              taxAmount={parsedData?.taxAmount}
              totalAmount={parsedData?.amount}
            />

            {/* Botones de acción inferiores */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 bg-(--bg-light) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex-2 py-2.5 px-4 bg-(--primary-color) text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99] shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <IconCheck size={18} />
                <span>Confirmar y Guardar Gasto</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
