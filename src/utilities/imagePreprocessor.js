/**
 * Módulo de preprocesamiento ligero y no destructivo para OCR.
 * Mantiene los niveles de grises naturales y antialiasing para que Leptonica/Tesseract
 * pueda segmentar los caracteres de tickets térmicos sin romper trazos finos.
 */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("No se pudo cargar la imagen: " + err));
    img.src = src;
  });
}

/**
 * Normaliza la resolución de la imagen si es demasiado pesada (> 2200px) o pequeña (< 1000px).
 * No aplica binarización forzada para no destruir fuentes de matriz de puntos.
 * @param {string} imageSrc Data URL o ruta de la imagen
 * @returns {Promise<string>} Data URL optimizado
 */
export async function preprocessReceiptImage(imageSrc) {
  try {
    const img = await loadImage(imageSrc);
    const { width, height } = img;

    // Si la imagen tiene un tamaño adecuado (~1200 a 2200px), usarla directamente
    if (width >= 1000 && width <= 2200) {
      return imageSrc;
    }

    let targetWidth = width;
    if (width > 2200) {
      targetWidth = 2000;
    } else if (width < 1000) {
      targetWidth = 1400;
    }

    const ratio = height / width;
    const targetHeight = Math.round(targetWidth * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return imageSrc;

    // Dibujar con suavizado natural
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    return canvas.toDataURL("image/jpeg", 0.95);
  } catch (error) {
    console.warn("Usando imagen original sin alterar:", error);
    return imageSrc;
  }
}
