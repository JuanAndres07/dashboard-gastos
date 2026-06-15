import React from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    // Reset state and reload the page
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError = 
        this.state.error?.name === "ChunkLoadError" ||
        this.state.error?.message?.includes("Failed to fetch dynamically imported module") ||
        this.state.error?.message?.includes("Importing a module script failed");

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-(--bg-light) text-left">
          <div 
            className="w-full max-w-md bg-(--settings-card-bg) p-8 rounded-2xl shadow-xl border border-(--sidebar-border) transition-all duration-300"
            style={{ border: "var(--card-border)" }}
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <IconAlertTriangle size={32} />
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-(--headings-color) mb-2">
                {isChunkError ? "Error de conexión" : "Algo salió mal"}
              </h2>

              {/* Description */}
              <p className="text-sm text-(--text-color)/80 mb-6 max-w-sm">
                {isChunkError 
                  ? "Hubo un problema de conexión al cargar esta sección. Esto puede deberse a una pérdida temporal de internet o a una actualización de la aplicación."
                  : "Ocurrió un error inesperado al renderizar esta sección. Por favor, intenta recargar la página."
                }
              </p>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:opacity-90 active:scale-[0.99] text-white font-semibold py-3 px-5 rounded-xl transition-all duration-300 cursor-pointer shadow-md shadow-primary/10"
                >
                  <IconRefresh size={18} className="shrink-0" />
                  <span>Reintentar carga</span>
                </button>
              </div>

              {/* Technical error details (collapsed by default) */}
              {!isChunkError && this.state.error && (
                <details className="mt-6 w-full text-left bg-(--bg-light)/50 border border-(--sidebar-border) rounded-xl p-3">
                  <summary className="text-[11px] font-bold text-(--text-color)/60 uppercase tracking-wider cursor-pointer hover:text-(--headings-color) select-none">
                    Detalles técnicos
                  </summary>
                  <pre className="mt-2 text-[10px] font-mono text-red-500 overflow-x-auto whitespace-pre-wrap max-h-24">
                    {this.state.error.stack || this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
