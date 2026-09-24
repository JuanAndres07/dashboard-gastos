import {
  IconCamera,
  IconSwitchHorizontal,
  IconAlertCircle,
} from "@tabler/icons-react";

export function CameraView({
  videoRef,
  canvasRef,
  cameraError,
  cameraReady,
  onLoadedMetadata,
  onToggleCamera,
  onCapture,
  onSwitchToUpload,
}) {
  return (
    <div className="relative w-full min-h-75 sm:min-h-95 bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-inner border border-(--sidebar-border)">
      {cameraError ? (
        <div className="p-8 text-center text-white space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <IconAlertCircle size={28} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">
              Acceso a cámara no disponible
            </h4>
            <p className="text-xs text-white/70">{cameraError}</p>
          </div>
          <button
            type="button"
            onClick={onSwitchToUpload}
            className="w-full py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Subir foto desde archivo
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={onLoadedMetadata}
            className="w-full h-full object-cover min-h-75 sm:min-h-95"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Guía visual para encuadrar la factura */}
          <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-3">
            <span className="bg-black/60 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-xs">
              Alinea el recibo dentro del marco
            </span>
            <span className="text-[10px] text-white/70">
              Procura buena iluminación y sin sombras
            </span>
          </div>

          {/* Barra de control inferior en visor */}
          <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-6 px-4">
            <button
              type="button"
              onClick={onToggleCamera}
              className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer backdrop-blur-xs active:scale-95 shadow-md"
              title="Cambiar entre cámara trasera y frontal"
            >
              <IconSwitchHorizontal size={20} />
            </button>

            <button
              type="button"
              onClick={onCapture}
              disabled={!cameraReady}
              className={`w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl transition-all border-4 border-white/50 ${
                cameraReady
                  ? "active:scale-90 hover:scale-105 cursor-pointer"
                  : "opacity-50 cursor-not-allowed disabled:pointer-events-none"
              }`}
              title={
                cameraReady ? "Capturar foto del recibo" : "Iniciando visor..."
              }
            >
              <div className="w-11 h-11 bg-(--primary-color) rounded-full flex items-center justify-center text-white shadow-inner">
                <IconCamera size={24} />
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
