import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, SetEmail] = useState("");
  const [message, SetMessage] = useState("");

  const handleResetRequest = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/update-password",
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      SetMessage(
        "Se ha enviado un correo electrónico para restablecer la contraseña.",
      );
    }
  };

  return (
    <div className="">
      <h2 className="">Recuperar Contraseña</h2>
      {message ? (
        <p className="text-success">{message}</p>
      ) : (
        <form onSubmit={handleResetRequest}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => SetEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Enviar Enlace de Restablecimiento
          </button>
        </form>
      )}
    </div>
  );
}
