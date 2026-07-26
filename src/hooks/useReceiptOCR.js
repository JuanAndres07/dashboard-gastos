import { useState, useCallback } from "react";
import Tesseract from "tesseract.js";
import { parseReceiptData } from "../utilities/receiptParser";

/**
 * Custom Hook para gestionar el escaneo OCR de facturas con Tesseract.js.
 */
export function useReceiptOCR() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const processReceipt = useCallback(async (imageSrc, onComplete) => {
    if (!imageSrc) return;

    setIsScanning(true);
    setProgress(0);
    setStatusText("Inicializando OCR...");

    try {
      const result = await Tesseract.recognize(imageSrc, "spa+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const progValue = Math.round((m.progress || 0) * 100);
            setProgress(progValue);
            setStatusText(`Analizando imagen... ${progValue}%`);
          } else if (m.status === "loading tesseract core") {
            setStatusText("Cargando componentes de OCR...");
          } else if (m.status === "loading language traineddata") {
            setStatusText("Cargando modelo de idioma...");
          } else {
            setStatusText(m.status || "Procesando...");
          }
        },
      });

      const extracted = parseReceiptData(result.data.text || "");

      setIsScanning(false);
      if (onComplete) {
        onComplete(extracted);
      }
    } catch (err) {
      console.error("Error durante el OCR:", err);
      setStatusText("Error al procesar la imagen.");
      setIsScanning(false);
    }
  }, []);

  const resetOCR = useCallback(() => {
    setIsScanning(false);
    setProgress(0);
    setStatusText("");
  }, []);

  return {
    isScanning,
    progress,
    statusText,
    processReceipt,
    resetOCR,
  };
}
