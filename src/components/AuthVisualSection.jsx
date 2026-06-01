import { useRef } from "react";
import { IconChartPie } from "@tabler/icons-react";

export default function AuthVisualSection({
  title,
  subtitle,
  badgeText,
  badgeIcon: BadgeIcon = IconChartPie,
}) {
  const visualRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!visualRef.current) return;
    const { left, top, width, height } =
      visualRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    visualRef.current.style.setProperty("--mouse-x", `${x}%`);
    visualRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <div
      ref={visualRef}
      onMouseMove={handleMouseMove}
      className="hidden lg:flex lg:w-1/2 relative bg-light items-center justify-center p-12 overflow-hidden z-10"
    >
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-150 ease-out -z-10"
        style={{
          background:
            "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), color-mix(in srgb, var(--primary-color) 15%, transparent) 0%, transparent 50%)",
        }}
      ></div>
      <div className="text-center max-w-lg z-20 flex flex-col items-center">
        <img src="/Logo.png" alt="Logo" width={320} className="mb-8" />
        <h1 className="text-4xl font-extrabold tracking-tight text-(--headings-color) mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-base text-(--text-color) opacity-80 mb-6 max-w-sm">
          {subtitle}
        </p>
        <div className="bg-(--settings-card-bg) border border-(--sidebar-border) py-2 px-4 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.03)] inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all duration-300">
          <BadgeIcon size={20} className="text-primary" />
          <span>{badgeText}</span>
        </div>
      </div>
    </div>
  );
}
