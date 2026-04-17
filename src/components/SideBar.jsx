import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  IconLayoutDashboard,
  IconReceipt,
  IconCategory,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import "./SideBar.css";

export default function SideBar() {
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

  return (
    <aside className={`sidebar ${!isExpanded ? "collapsed" : ""}`}>
      <button
        className="toggle-btn"
        onClick={toggleSidebar}
        title={isExpanded ? "Contraer" : "Expandir"}
      >
        {isExpanded ? (
          <IconChevronLeft size={16} />
        ) : (
          <IconChevronRight size={16} />
        )}
      </button>

      <div className="sidebar-header">
        <Link to="/" className="d-flex align-items-center text-decoration-none">
          {isExpanded ? (
            <img
              src="/LogoHorizontal.png"
              alt="FinFlow Logo"
              className="logo-img expanded"
            />
          ) : (
            <img src="/Icon.png" alt="Menu" className="logo-img collapsed" />
          )}
        </Link>
      </div>

      <ul className="nav-list">
        <li className="nav-item">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link-custom ${isActive ? "active" : ""}`
            }
            end
          >
            <IconLayoutDashboard size={22} />
            <span className="link-text">Inicio</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `nav-link-custom ${isActive ? "active" : ""}`
            }
          >
            <IconReceipt size={22} />
            <span className="link-text">Transacciones</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `nav-link-custom ${isActive ? "active" : ""}`
            }
          >
            <IconCategory size={22} />
            <span className="link-text">Categorías</span>
          </NavLink>
        </li>
      </ul>

      <div className="footer-section">
        <button onClick={handleLogout} className="logout-btn">
          <IconLogout size={20} />
          <span className="logout-text">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
