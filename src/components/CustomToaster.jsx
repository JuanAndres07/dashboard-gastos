import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "../contexts/ThemeContext";

export default function CustomToaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      expand={false}
      toastOptions={{
        style: {
          fontFamily: "'Inter', sans-serif",
          borderRadius: "12px",
        },
        className: "border border-gray-100 dark:border-slate-800 shadow-lg",
      }}
    />
  );
}
