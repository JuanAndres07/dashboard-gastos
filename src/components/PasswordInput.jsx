import { useState } from "react";
import { IconLockPassword, IconEye, IconEyeOff } from "@tabler/icons-react";

export default function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  minLength,
  id,
  name,
  className = "",
  inputClassName = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-(--headings-color) mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <div className="absolute left-4 text-(--text-color) pointer-events-none">
          <IconLockPassword size={20} stroke={1.5} />
        </div>
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          className={`w-full bg-light border border-(--sidebar-border) rounded-xl py-3 pl-12 pr-12 text-(--headings-color) placeholder:text-(--text-color)/40 focus:outline-none focus:border-primary focus:bg-(--settings-card-bg) transition-all duration-300 ease-in-out ${inputClassName}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 text-(--text-color)/60 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
          aria-label={showPassword ? `Ocultar ${label?.toLowerCase() || "contraseña"}` : `Mostrar ${label?.toLowerCase() || "contraseña"}`}
        >
          {showPassword ? (
            <IconEyeOff size={20} stroke={1.5} />
          ) : (
            <IconEye size={20} stroke={1.5} />
          )}
        </button>
      </div>
    </div>
  );
}
