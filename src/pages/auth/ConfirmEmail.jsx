import { Link } from "react-router-dom";
import { IconMailOpened } from "@tabler/icons-react";

export default function ConfirmEmail() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-light p-6">
      <div className="w-full max-w-[480px] bg-(--settings-card-bg) border border-(--sidebar-border) rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8 sm:p-10 flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary">
          <IconMailOpened size={48} stroke={1.5} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--headings-color) mb-4">
          Confirma tu correo electrónico
        </h1>

        <p className="text-(--text-color) text-sm mb-2">
          Hemos enviado un enlace de confirmación a tu dirección de correo
          electrónico.
        </p>
        <p className="text-(--text-color) text-sm mb-8 font-medium">
          Una vez confirmado, podrás acceder a tu cuenta.
        </p>

        <Link
          to="/"
          className="w-full bg-primary text-white py-3.5 px-6 rounded-xl font-semibold shadow-[0_4px_15_rgba(0,82,204,0.15)] hover:shadow-[0_8px_25_rgba(0,82,204,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-in-out"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
