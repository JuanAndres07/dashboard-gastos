import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { IconMenu } from "@tabler/icons-react";

export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-(--bg-light) text-(--text-color) transition-all duration-300 ease-in-out">
      {/* Cabecera Móvil */}
      <header className="md:hidden grid grid-cols-3 items-center px-4 bg-(--settings-card-bg) border-b border-(--sidebar-border) sticky top-0 z-30">
        <div className="flex justify-start">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1 hover:bg-(--sidebar-link-hover-bg) rounded-xl transition-all duration-300 cursor-pointer"
            aria-label="Abrir menú"
          >
            <img
              src="/Menu.png"
              alt="Menu"
              style={{ width: "36px", height: "36px" }}
            />
          </button>
        </div>
        <div className="flex justify-center">
          <img
            src="/LogoHorizontal.png"
            alt="FinFlow Logo"
            style={{ height: "60px" }}
          />
        </div>
        <div></div>
      </header>

      {/* Backdrop para móviles */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar de navegación */}
      <SideBar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Contenido principal */}
      <main className="grow p-6 text-left w-full md:w-auto">
        <Outlet />
      </main>
    </div>
  );
}
