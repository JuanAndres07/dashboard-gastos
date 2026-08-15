import { IconLoader2 } from "@tabler/icons-react";

export function ScanProgressBar({ progress, statusText }) {
  return (
    <div className="space-y-2 p-3 bg-(--bg-light) rounded-xl border border-(--sidebar-border)">
      <div className="flex justify-between items-center text-xs font-semibold text-(--headings-color)">
        <span className="flex items-center gap-1.5">
          <IconLoader2 size={16} className="animate-spin text-(--primary-color)" />
          {statusText}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-(--primary-color) transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
