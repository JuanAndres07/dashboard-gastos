import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function UpdatePassword() {
  const [newPassword, SetNewPassword] = useState("");
  const [confirmPassword, SetConfirmPassword] = useState("");
  const Navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert("Error al actualizar la contraseña: " + error.message);
    } else {
      alert("Contraseña actualizada correctamente. ");
      Navigate("/login");
    }
  };

  return (
    <div className="">
      <h2>Actualizar Contraseña</h2>
      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            Nueva Contraseña
          </label>
          <input
            type="password"
            className="form-control"
            id="newPassword"
            value={newPassword}
            onChange={(e) => SetNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => SetConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Actualizar Contraseña
        </button>
      </form>
    </div>
  );
}
