import { useNavigate } from "react-router-dom";
import { ReceiptCaptureView } from "../components/receipt-scanner/ReceiptCaptureView";
import { ReceiptProcessingView } from "../components/receipt-scanner/ReceiptProcessingView";
import { ReceiptWorkspaceView } from "../components/receipt-scanner/ReceiptWorkspaceView";
import { useReceiptScanner } from "../hooks/useReceiptScanner";
import { IconArrowLeft, IconReceipt } from "@tabler/icons-react";

export default function ScanReceipt({ user }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/transactions");
    }
  };

  const {
    sourceMode,
    setSourceMode,
    imageSrc,
    parsedData,
    scannedItems,
    setScannedItems,
    saveMode,
    setSaveMode,
    singleCategoryId,
    setSingleCategoryId,
    customDescription,
    setCustomDescription,
    customDate,
    setCustomDate,
    categories,
    isScanning,
    progress,
    statusText,
    errorText,
    isSaving,
    displayTotal,
    videoRef,
    canvasRef,
    cameraError,
    cameraReady,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
    handleLoadedMetadata,
    handleImageSelected,
    handleResetAll,
    handleSaveToDatabase,
  } = useReceiptScanner({ user, isActive: true });

  return (
    <div className="w-full space-y-6 text-left pb-10">
      {/* Encabezado principal */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 rounded-lg text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) transition-colors inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
            >
              <IconArrowLeft size={16} />
              <span>Volver</span>
            </button>
          </div>
          <h1 className="text-3xl font-extrabold text-(--headings-color) tracking-tight flex items-center gap-2.5">
            <IconReceipt size={32} className="text-(--primary-color)" />
            Escanear Factura o Recibo
          </h1>
          <p className="text-sm text-(--text-color)/85 mt-1">
            Digitaliza y extrae los productos de tus comprobantes de compra
            automáticamente mediante reconocimiento óptico de texto (OCR).
          </p>
        </div>

        {imageSrc && !isScanning && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2 bg-(--bg-light) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-xs transition-all border border-(--sidebar-border) cursor-pointer"
            >
              Escanear Otro
            </button>
          </div>
        )}
      </header>

      {/* Vista 1: Selector y Captura de Imagen (Cámara o Subida) */}
      {!imageSrc && !isScanning && (
        <ReceiptCaptureView
          sourceMode={sourceMode}
          setSourceMode={setSourceMode}
          videoRef={videoRef}
          canvasRef={canvasRef}
          cameraError={cameraError}
          cameraReady={cameraReady}
          onLoadedMetadata={handleLoadedMetadata}
          onToggleCamera={toggleFacingMode}
          onCapture={capturePhoto}
          onFileSelect={handleImageSelected}
          stopCamera={stopCamera}
        />
      )}

      {/* Vista 2: Procesamiento OCR en Curso */}
      {isScanning && (
        <ReceiptProcessingView
          progress={progress}
          statusText={statusText}
          onCancel={handleResetAll}
        />
      )}

      {/* Vista 3: Workspace de 2 Columnas (Side-by-Side) */}
      {!isScanning && imageSrc && (
        <ReceiptWorkspaceView
          imageSrc={imageSrc}
          parsedData={parsedData}
          errorText={errorText}
          scannedItems={scannedItems}
          setScannedItems={setScannedItems}
          saveMode={saveMode}
          setSaveMode={setSaveMode}
          singleCategoryId={singleCategoryId}
          setSingleCategoryId={setSingleCategoryId}
          customDescription={customDescription}
          setCustomDescription={setCustomDescription}
          customDate={customDate}
          setCustomDate={setCustomDate}
          categories={categories}
          displayTotal={displayTotal}
          isSaving={isSaving}
          onResetImage={handleResetAll}
          onCancel={handleBack}
          onSaveToDatabase={handleSaveToDatabase}
        />
      )}
    </div>
  );
}
