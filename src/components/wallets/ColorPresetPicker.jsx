export const COLOR_PRESETS = [
  "#3b82f6", // Azul
  "#10b981", // Esmeralda
  "#f59e0b", // Ámbar
  "#8b5cf6", // Morado
  "#ec4899", // Rosa
  "#06b6d4", // Cyan
  "#f97316", // Naranja
  "#64748b", // Pizarra
];

export function ColorPresetPicker({ color, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-(--text-color) tracking-wide">
        Color Identificativo
      </label>
      <div className="flex items-center gap-1.5 p-1.5 bg-(--bg-light) border border-(--sidebar-border) rounded-xl overflow-x-auto">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`w-6 h-6 rounded-lg shrink-0 transition-transform cursor-pointer ${
              color === c ? "scale-125 ring-2 ring-(--headings-color)" : "hover:scale-110"
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}
