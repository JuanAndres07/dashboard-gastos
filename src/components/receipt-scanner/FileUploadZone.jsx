import { useRef } from "react";
import { IconUpload } from "@tabler/icons-react";

export function FileUploadZone({ onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG, etc).");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onFileSelect(event.target.result);
      }
      e.target.value = "";
    };
    reader.onerror = () => {
      alert("Error al leer el archivo seleccionado.");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

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
      className="w-full aspect-4/3 border-2 border-dashed border-(--primary-color)/40 hover:border-(--primary-color) bg-(--bg-light) rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="w-14 h-14 bg-(--primary-color)/10 text-(--primary-color) rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        <IconUpload size={28} />
      </div>
      <p className="text-sm font-semibold text-(--headings-color)">
        Haz clic para seleccionar o tomar una foto
      </p>
      <p className="text-xs text-(--text-color) mt-1">
        Soporta PNG, JPG, JPEG o fotos de celular
      </p>
    </div>
  );
}

