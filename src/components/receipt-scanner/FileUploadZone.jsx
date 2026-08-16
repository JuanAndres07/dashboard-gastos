import { useRef, useState, useEffect } from "react";
import { IconUpload, IconClipboard, IconPhotoPlus } from "@tabler/icons-react";
import { toast } from "sonner";

export function FileUploadZone({ onFileSelect }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;

    const isImageByType = file.type ? file.type.startsWith("image/") : false;
    const isImageByExt = /\.(jpe?g|png|webp|gif|bmp|heic|heif|tiff?)$/i.test(
      file.name || "",
    );
    const isValidImage = isImageByType || isImageByExt;

    if (!isValidImage) {
      toast.error(
        "Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG, WEBP, HEIC).",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onFileSelect(event.target.result);
      }
    };
    reader.onerror = () => {
      toast.error("Error al leer el archivo seleccionado.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Soporte para pegar imagen desde el portapapeles (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            toast.info("Imagen pegada desde el portapapeles");
            processFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full min-h-70 sm:min-h-85 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-(--primary-color) ${
        isDragging
          ? "border-(--primary-color) bg-(--primary-color)/10 scale-[0.99]"
          : "border-(--sidebar-border) hover:border-(--primary-color)/70 bg-(--bg-light)"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="w-16 h-16 bg-(--primary-color)/10 text-(--primary-color) rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-(--primary-color)/20 transition-all">
        <IconUpload size={32} />
      </div>

      <h3 className="text-base font-bold text-(--headings-color) mb-1">
        Haz clic para subir o arrastra tu recibo aquí
      </h3>
      <p className="text-xs text-(--text-color) max-w-sm mb-4">
        Soporta fotos nítidas en PNG, JPG, JPEG, WEBP o capturas de pantalla de
        tus compras.
      </p>

      <div className="flex items-center gap-4 text-[11px] text-(--text-color)/80 bg-(--settings-card-bg) border border-(--sidebar-border) px-3 py-1.5 rounded-xl">
        <span className="flex items-center gap-1">
          <IconClipboard size={14} className="text-(--primary-color)" /> Puedes
          pegar con{" "}
          <kbd className="px-1.5 py-0.5 bg-(--bg-light) border border-(--sidebar-border) rounded font-mono text-[10px]">
            Ctrl+V
          </kbd>
        </span>
      </div>
    </div>
  );
}
