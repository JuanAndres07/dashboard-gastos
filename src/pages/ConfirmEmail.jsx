import { Link } from "react-router-dom";

export default function ConfirmEmail() {
  return (
    <div className="container-fluid vh-100 auth-container">
      <div className="row h-100">
        <div className="col-lg-6 d-flex flex-column align-items-center h-100 p-4">
          <div className="flex-grow-1 d-flex flex-column justify-content-center w-100 align-items-center">
            <div className="form-wrapper">
              <div className="mb-4 d-flex flex-column align-items-center">
                <img
                  src="/Icon.png"
                  alt="Icono"
                  width={80}
                  className="mb-3 d-lg-none"
                />
                <h1>Confirma tu correo electrónico</h1>
                <p>Revisa tu correo electrónico para confirmar tu cuenta.</p>
                <p>Una vez confirmado, podrás iniciar sesión.</p>
                <Link to="/" className="btn btn-primary">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
