import { IconCamera, IconSwitchHorizontal, IconAlertCircle } from "@tabler/icons-react";

export function CameraView({
  videoRef,
  canvasRef,
  cameraError,
  onToggleCamera,
  onCapture,
  onSwitchToUpload,
}) {
  return (
    <div className="relative w-full aspect-4/3 bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-inner border border-(--sidebar-border)">
      {cameraError ? (
        <div className="p-6 text-center text-white space-y-3">
          <IconAlertCircle size={36} className="mx-auto text-amber-400" />
          <p className="text-sm font-medium">{cameraError}</p>
          <button
            onClick={onSwitchToUpload}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Seleccionar foto desde archivo
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Guía visual para centrar la factura */}
          <div className="absolute inset-6 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
            <span className="bg-black/50 text-white/90 text-xs px-3 py-1 rounded-full backdrop-blur-xs">
              Centra tu factura aquí
            </span>
          </div>

          {/* Botones de acción en visor */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 px-4">
            <button
              type="button"
              onClick={onToggleCamera}
              className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer backdrop-blur-xs"
              title="Cambiar cámara"
            >
              <IconSwitchHorizontal size={20} />
            </button>

            <button
              type="button"
              onClick={onCapture}
              className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer border-4 border-white/40"
              title="Tomar Foto"
            >
              <div className="w-10 h-10 bg-(--primary-color) rounded-full flex items-center justify-center text-white">
                <IconCamera size={22} />
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
