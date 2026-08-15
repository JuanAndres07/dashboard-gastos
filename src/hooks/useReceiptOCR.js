import { useState, useCallback, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { parseReceiptData } from "../utilities/receiptParser";
import { preprocessReceiptImage } from "../utilities/imagePreprocessor";

/**
 * Custom Hook para gestionar el escaneo OCR de facturas con Tesseract.js.
 */
export function useReceiptOCR() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState(null);

  const workerRef = useRef(null);
  const isCancelledRef = useRef(false);

  const cancelOCR = useCallback(async () => {
    isCancelledRef.current = true;
    if (workerRef.current) {
      try {
        await workerRef.current.terminate();
      } catch (err) {
        console.warn("Error al terminar worker de Tesseract:", err);
      }
      workerRef.current = null;
    }
    setIsScanning(false);
    setProgress(0);
    setStatusText("");
    setErrorText(null);
  }, []);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const processReceipt = useCallback(async (imageSrc, onComplete) => {
    if (!imageSrc) return;

    isCancelledRef.current = false;
    setIsScanning(true);
    setProgress(5);
    setStatusText("Preparando imagen...");
    setErrorText(null);

    try {
      // Normalización suave de resolución
      const imageToProcess = await preprocessReceiptImage(imageSrc);

      if (isCancelledRef.current) return;

      setProgress(15);
      setStatusText("Iniciando motor de reconocimiento OCR...");

      const worker = await Tesseract.createWorker("spa+eng", 1, {
        logger: (m) => {
          if (isCancelledRef.current) return;

          if (m.status === "recognizing text") {
            const rawProg = m.progress || 0;
            const progValue = Math.round(20 + rawProg * 70);
            setProgress(progValue);
            setStatusText(`Leyendo factura... ${progValue}%`);
          } else if (m.status === "loading tesseract core") {
            setStatusText("Cargando componentes OCR...");
          } else if (m.status === "loading language traineddata") {
            setStatusText("Cargando modelos de texto...");
          }
        },
      });

      if (isCancelledRef.current) {
        await worker.terminate();
        return;
      }

      workerRef.current = worker;

      // Preservar espacios inter-palabras sin forzar PSM rígido
      await worker.setParameters({
        preserve_interword_spaces: "1",
      });

      if (isCancelledRef.current) {
        await worker.terminate();
        return;
      }

      const result = await worker.recognize(imageToProcess);

      if (isCancelledRef.current) {
        await worker.terminate();
        return;
      }

      setProgress(95);
      setStatusText("Estructurando productos y totales...");

      await worker.terminate();
      workerRef.current = null;

      const rawText = result?.data?.text || "";
      const extracted = parseReceiptData(rawText);

      setProgress(100);
      setIsScanning(false);
      setStatusText("");

      if (onComplete && !isCancelledRef.current) {
        onComplete(extracted);
      }
    } catch (err) {
      if (isCancelledRef.current) return;
      console.error("Error durante el OCR:", err);
      setErrorText("No se pudo leer la factura con suficiente claridad. Puedes editar o ingresar los datos manualmente.");
      setIsScanning(false);
      if (workerRef.current) {
        try {
          await workerRef.current.terminate();
        } catch (_) {}
        workerRef.current = null;
      }
    }
  }, []);

  return {
    isScanning,
    progress,
    statusText,
    errorText,
    processReceipt,
    resetOCR: cancelOCR,
    cancelOCR,
  };
}
