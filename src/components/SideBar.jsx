import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SideBar() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
    } else {
      console.log("Cierre de sesión exitoso");
    }
  };

  return (
    <aside
      className="d-flex flex-column p-3"
      style={{ width: "280px", minHeight: "100vh" }}
    >
      <Link
        to="/"
        className="d-flex align-items-center text-black text-decoration-none"
      >
        <span className="fs-4">Mis Gastos</span>
      </Link>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto text-start">
        <li className="nav-item mb-2">
          <Link to="/" className="nav-link">
            Dashboard
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/transactions" className="nav-link">
            Transactions
          </Link>
        </li>
      </ul>
      <hr />
      <div className="dropdown">
        <button onClick={handleLogout} className="btn btn-danger w-100">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
