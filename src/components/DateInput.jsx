import { IconCalendar } from "@tabler/icons-react";
import { useTheme } from "../contexts/ThemeContext";

export default function DateInput({
  value,
  onChange,
  min,
  max,
  id,
  required = false,
  className = "",
  inputClassName = "",
  disabled = false,
}) {
  const { theme } = useTheme();

  const triggerPicker = (e) => {
    if (disabled) return;
    const input = e.currentTarget.querySelector('input[type="date"]');
    if (input && typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch (err) {
        console.error("Error opening date picker:", err);
      }
    }
  };

  return (
    <div
      onClick={triggerPicker}
      className={`relative cursor-pointer ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-(--text-color)/60 pointer-events-none">
        <IconCalendar size={18} stroke={1.5} />
      </span>

      <input
        id={id}
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        className={`w-full pl-11 pr-4 py-2.5 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-xl text-(--headings-color) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer disabled:cursor-not-allowed
        [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:disabled:cursor-not-allowed ${inputClassName}`}
        style={{ border: "var(--card-border)", colorScheme: theme }}
      />
    </div>
  );
}
