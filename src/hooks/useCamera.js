import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Custom Hook para gestionar el stream de la cámara web/dispositivo móvil.
 */
export function useCamera({ isActive, onCapture }) {
  const [facingMode, setFacingMode] = useState("environment");
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const cancelledRef = useRef(false);

  const stopCamera = useCallback(() => {
    cancelledRef.current = true;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    setCameraReady(true);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    cancelledRef.current = false;
    setCameraError(null);
    setCameraReady(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("El navegador no soporta el acceso a la cámara.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (cancelledRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      if (cancelledRef.current) return;
      console.warn("No se pudo iniciar la cámara:", err);
      setCameraError(
        "No se pudo acceder a la cámara. Puedes usar la opción de subir una foto."
      );
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isActive, facingMode, startCamera, stopCamera]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !cameraReady || videoRef.current.videoWidth === 0) {
      return null;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    stopCamera();

    if (onCapture) {
      onCapture(dataUrl);
    }
    return dataUrl;
  };

  return {
    videoRef,
    canvasRef,
    cameraError,
    cameraReady,
    facingMode,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
    handleLoadedMetadata,
  };
}
