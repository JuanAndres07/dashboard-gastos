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
  const mountedRef = useRef(true);
  const scanIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (workerRef.current) {
        workerRef.current.terminate().catch(() => {});
        workerRef.current = null;
      }
    };
  }, []);

  const cancelOCR = useCallback(async () => {
    isCancelledRef.current = true;
    scanIdRef.current++;
    if (workerRef.current) {
      const workerToTerminate = workerRef.current;
      workerRef.current = null;
      try {
        await workerToTerminate.terminate();
      } catch (err) {
        console.warn("Error al terminar worker de Tesseract:", err);
      }
    }
    if (mountedRef.current) {
      setIsScanning(false);
      setProgress(0);
      setStatusText("");
      setErrorText(null);
    }
  }, []);

  const processReceipt = useCallback(async (imageSrc, onComplete) => {
    if (!imageSrc) return;

    // Incrementar ID de escaneo para invalidar cualquier proceso anterior
    const currentScanId = ++scanIdRef.current;
    isCancelledRef.current = false;

    // Si había un worker previo en ejecución, liberarlo
    if (workerRef.current) {
      const prevWorker = workerRef.current;
      workerRef.current = null;
      prevWorker.terminate().catch(() => {});
    }

    const isStale = () =>
      !mountedRef.current ||
      isCancelledRef.current ||
      scanIdRef.current !== currentScanId;

    if (mountedRef.current) {
      setIsScanning(true);
      setProgress(5);
      setStatusText("Preparando imagen...");
      setErrorText(null);
    }

    try {
      // Normalización suave de resolución
      const imageToProcess = await preprocessReceiptImage(imageSrc);

      if (isStale()) return;

      if (mountedRef.current) {
        setProgress(15);
        setStatusText("Iniciando motor de reconocimiento OCR...");
      }

      const worker = await Tesseract.createWorker("spa+eng", 1, {
        logger: (m) => {
          if (isStale()) return;

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

      if (isStale()) {
        await worker.terminate().catch(() => {});
        return;
      }

      workerRef.current = worker;

      // Preservar espacios inter-palabras sin forzar PSM rígido
      await worker.setParameters({
        preserve_interword_spaces: "1",
      });

      if (isStale()) {
        await worker.terminate().catch(() => {});
        return;
      }

      const result = await worker.recognize(imageToProcess);

      if (isStale()) {
        await worker.terminate().catch(() => {});
        return;
      }

      if (mountedRef.current) {
        setProgress(95);
        setStatusText("Estructurando productos y totales...");
      }

      await worker.terminate().catch(() => {});
      if (workerRef.current === worker) {
        workerRef.current = null;
      }

      const rawText = result?.data?.text || "";
      const extracted = parseReceiptData(rawText);

      if (!isStale()) {
        setProgress(100);
        setIsScanning(false);
        setStatusText("");

        if (onComplete) {
          onComplete(extracted);
        }
      }
    } catch (err) {
      if (isStale()) return;
      console.error("Error durante el OCR:", err);
      if (mountedRef.current) {
        setErrorText("No se pudo leer la factura con suficiente claridad. Puedes editar o ingresar los datos manualmente.");
        setIsScanning(false);
      }
      if (workerRef.current) {
        try {
          await workerRef.current.terminate();
        } catch (terminateErr) {
          console.warn("Error al terminar worker en catch:", terminateErr);
        }
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
    cancelOCR,
  };
}
