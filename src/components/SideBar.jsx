import { useState } from "react";
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
} from "@tabler/icons-react";
import "../styles/components/SideBar.css";

export default function SideBar({ isMobileOpen, setIsMobileOpen }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
    } else {
      console.log("Cierre de sesión exitoso");
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const getNavLinkClass = (isActive) => {
    const baseClasses =
      "nav-link-custom flex items-center px-4 py-3 rounded-xl text-(--sidebar-text) no-underline transition-all duration-300 ease-in-out whitespace-nowrap hover:bg-(--sidebar-link-hover-bg) hover:text-(--sidebar-text-hover)";
    const activeClasses =
      "active bg-primary text-white shadow-[0_4px_12px_rgba(0,82,204,0.2)]";
    const collapsedClasses = isExpanded ? "" : "justify-center px-0";
    return `${baseClasses} ${isActive ? activeClasses : ""} ${collapsedClasses}`;
  };

  return (
    <aside
      className={`sidebar ${!isExpanded ? "collapsed" : ""} ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >
      {/* Encabezado interactivo para colapsar */}
      <div
        className={`sidebar-header flex items-center cursor-pointer transition-all duration-300 ease-in-out hover:opacity-80 ${
          isExpanded ? "h-20 px-5" : "h-20 justify-center p-0"
        }`}
        onClick={toggleSidebar}
        title={isExpanded ? "Contraer" : "Expandir"}
      >
        {isExpanded ? (
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
        <li className="nav-item m-0">
          <NavLink
            to="/"
            className={({ isActive }) => getNavLinkClass(isActive)}
            end
          >
            <IconLayoutDashboard size={22} className="shrink-0" />
            {isExpanded && (
              <span className="link-text ml-3 font-medium transition-opacity duration-200">
                Inicio
              </span>
            )}
          </NavLink>
        </li>
        <li className="nav-item m-0">
          <NavLink
            to="/transactions"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <IconReceipt size={22} className="shrink-0" />
            {isExpanded && (
              <span className="link-text ml-3 font-medium transition-opacity duration-200">
                Transacciones
              </span>
            )}
          </NavLink>
        </li>
        <li className="nav-item m-0">
          <NavLink
            to="/categories"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <IconCategory size={22} className="shrink-0" />
            {isExpanded && (
              <span className="link-text ml-3 font-medium transition-opacity duration-200">
                Categorías
              </span>
            )}
          </NavLink>
        </li>
        <li className="nav-item m-0">
          <NavLink
            to="/subscriptions"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <IconRefresh size={22} className="shrink-0" />
            {isExpanded && (
              <span className="link-text ml-3 font-medium transition-opacity duration-200">
                Suscripciones
              </span>
            )}
          </NavLink>
        </li>
        <li className="nav-item m-0">
          <NavLink
            to="/budgets"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <IconClockDollar size={22} className="shrink-0" />
            {isExpanded && (
              <span className="link-text ml-3 font-medium transition-opacity duration-200">
                Presupuestos
              </span>
            )}
          </NavLink>
        </li>
        <li className="nav-item m-0">
          <NavLink
            to="/analysis"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <IconActivity size={22} className="shrink-0" />
            {isExpanded && (
              <span className="link-text ml-3 font-medium transition-opacity duration-200">
                Análisis y Reportes
              </span>
            )}
          </NavLink>
        </li>
        <li className="nav-item m-0">
          <NavLink
            to="/configuration"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <IconSettings size={22} className="shrink-0" />
            {isExpanded && (
              <span className="link-text ml-3 font-medium transition-opacity duration-200">
                Configuración
              </span>
            )}
          </NavLink>
        </li>
      </ul>

      {/* Sección del Footer */}
      <div
        className={`footer-section p-4 border-t border-(--sidebar-border) ${
          isExpanded ? "" : "flex justify-center"
        }`}
      >
        <button
          onClick={handleLogout}
          className={`logout-btn w-full flex items-center justify-center gap-2 p-3 rounded-xl border-none bg-[#fff1f2] text-[#e11d48] font-semibold transition-all duration-300 ease-in-out hover:bg-[#ffe4e6] hover:text-[#be123c] cursor-pointer ${
            isExpanded ? "" : "px-0"
          }`}
        >
          <IconLogout size={20} className="shrink-0" />
          {isExpanded && (
            <span className="logout-text text-sm">Cerrar sesión</span>
          )}
        </button>
      </div>
    </aside>
  );
}
