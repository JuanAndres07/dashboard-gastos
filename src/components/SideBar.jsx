import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  IconLayoutDashboard,
  IconReceipt,
  IconCategory,
  IconLogout,
  IconRefresh,
  IconClockDollar,
  IconActivity,
  IconSettings,
  IconLoader2,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/components/SideBar.css";

const menuItems = [
  { to: "/", label: "Inicio", icon: IconLayoutDashboard, end: true },
  { to: "/transactions", label: "Transacciones", icon: IconReceipt },
  { to: "/categories", label: "Categorías", icon: IconCategory },
  { to: "/subscriptions", label: "Suscripciones", icon: IconRefresh },
  { to: "/budgets", label: "Presupuestos", icon: IconClockDollar },
  { to: "/analysis", label: "Análisis y Reportes", icon: IconActivity },
  { to: "/configuration", label: "Configuración", icon: IconSettings },
];

export default function SideBar({ isMobileOpen, setIsMobileOpen }) {
  const { theme, setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    return saved !== null ? saved === "true" : true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", isExpanded);
  }, [isExpanded]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error.message);
        setIsLoggingOut(false);
      }
    } catch (err) {
      console.error("Error inesperado al cerrar sesión:", err);
      setIsLoggingOut(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) return;
    setIsExpanded(!isExpanded);
  };

  const showExpandedContent = isExpanded || isMobile;

  const getThemeBtnClass = () => {
    const baseClasses =
      "theme-toggle-btn flex items-center w-full px-4 py-3 rounded-xl text-(--sidebar-text) transition-all duration-300 ease-in-out whitespace-nowrap hover:bg-(--sidebar-link-hover-bg) hover:text-(--sidebar-text-hover) cursor-pointer border-none bg-transparent";
    const collapsedClasses = showExpandedContent ? "justify-between" : "justify-center px-0";
    return `${baseClasses} ${collapsedClasses}`;
  };

  const getNavLinkClass = (isActive) => {
    const baseClasses =
      "nav-link-custom flex items-center px-4 py-3 rounded-xl text-(--sidebar-text) no-underline transition-all duration-300 ease-in-out whitespace-nowrap hover:bg-(--sidebar-link-hover-bg) hover:text-(--sidebar-text-hover)";
    const activeClasses =
      "active bg-primary text-white shadow-[0_4px_12px_rgba(0,82,204,0.2)]";
    const collapsedClasses = showExpandedContent ? "" : "justify-center px-0";
    return `${baseClasses} ${isActive ? activeClasses : ""} ${collapsedClasses}`;
  };

  return (
    <aside
      className={`sidebar ${!showExpandedContent ? "collapsed" : ""} ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >
      {/* Encabezado interactivo para colapsar */}
      <div
        className={`sidebar-header flex items-center transition-all duration-300 ease-in-out ${
          isMobile
            ? "h-20 px-5"
            : (isExpanded
              ? "h-20 px-5 cursor-pointer hover:opacity-80"
              : "h-20 justify-center p-0 cursor-pointer hover:opacity-80")
        }`}
        onClick={isMobile ? undefined : toggleSidebar}
        title={isMobile ? undefined : (isExpanded ? "Contraer" : "Expandir")}
      >
        {showExpandedContent ? (
          <div className="flex items-center gap-3 w-full">
            <img
              src="/Menu.png"
              alt="Menu"
              className="logo-img menu-icon shrink-0"
              style={{ width: "36px", height: "36px" }}
            />
            <img
              src="/LogoHorizontal2.png"
              alt="FinFlow Logo"
              className="logo-img expanded"
              style={{ maxWidth: "130px" }}
            />
          </div>
        ) : (
          <img
            src="/Menu.png"
            alt="Menu"
            className="logo-img collapsed"
            style={{ width: "36px", height: "36px" }}
          />
        )}
      </div>

      {/* Lista de Navegación */}
      <ul
        className="nav-list list-none px-3 m-0 grow flex flex-col gap-2"
        onClick={() => setIsMobileOpen?.(false)}
      >
        {menuItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="nav-item m-0">
            <NavLink
              to={to}
              className={({ isActive }) => getNavLinkClass(isActive)}
              end={end}
            >
              <Icon size={22} className="shrink-0" />
              {showExpandedContent && (
                <span className="link-text ml-3 font-medium transition-opacity duration-200">
                  {label}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Sección del Footer */}
      <div
        className={`footer-section p-4 border-t border-(--sidebar-border) flex flex-col gap-3 ${
          showExpandedContent ? "" : "items-center"
        }`}
      >
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={getThemeBtnClass()}
          title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        >
          <div className="flex items-center">
            {theme === "light" ? (
              <IconSun size={20} className="shrink-0" />
            ) : (
              <IconMoon size={20} className="shrink-0" />
            )}
            {showExpandedContent && (
              <span className="link-text ml-3 font-medium text-sm transition-opacity duration-200">
                {theme === "light" ? "Modo Claro" : "Modo Oscuro"}
              </span>
            )}
          </div>
          {showExpandedContent && (
            <div
              className={`theme-switch-slider relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300 ${
                theme === "dark" ? "bg-(--primary-color)" : "bg-(--text-color)/20"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${
                  theme === "dark" ? "translate-x-4.5" : "translate-x-1"
                }`}
              />
            </div>
          )}
        </button>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`logout-btn w-full flex items-center justify-center gap-2 p-3 rounded-xl border-none bg-[#fff1f2] text-[#e11d48] font-semibold transition-all duration-300 ease-in-out hover:bg-[#ffe4e6] hover:text-[#be123c] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            showExpandedContent ? "" : "px-0"
          }`}
        >
          {isLoggingOut ? (
            <IconLoader2 size={20} className="shrink-0 animate-spin" />
          ) : (
            <IconLogout size={20} className="shrink-0" />
          )}
          {showExpandedContent && (
            <span className="logout-text text-sm">
              {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

