import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfirmProvider } from "./contexts/ConfirmContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);
