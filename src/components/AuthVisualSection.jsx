import { useRef } from "react";
import { IconChartPie } from "@tabler/icons-react";

export default function AuthVisualSection({ 
  title, 
  subtitle, 
  badgeText, 
  badgeIcon: BadgeIcon = IconChartPie 
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
      className="col-lg-6 auth-visual-section d-none d-lg-flex"
    >
      <div className="interactive-bg"></div>
      <div className="text-center p-5" style={{ zIndex: 2 }}>
        <img src="/Logo.png" alt="Logo" width={400} />
        <h1 className="display-5 mb-3">
          {title}
        </h1>
        <p className="lead text-secondary opacity-75">
          {subtitle}
        </p>
        <div className="feature-badge">
          <BadgeIcon size={20} />
          <span>{badgeText}</span>
        </div>
      </div>
    </div>
  );
}
