/**
 * Utilidades para cálculo de totales y generación de identificadores en el módulo de escaneo.
 */

/**
 * Suma los montos numéricos de un arreglo de items.
 * @param {Array<{ amount?: string|number }>} items
 * @returns {number}
 */
export function sumItems(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((acc, item) => {
    const val = parseFloat(item?.amount);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
}

/**
 * Calcula el monto total a mostrar y guardar de forma unificada.
 * Si la suma de items es mayor a 0, usa la suma de items.
 * En caso contrario, recurre al total detectado en parsedData o "0.00".
 * @param {Array<{ amount?: string|number }>} scannedItems
 * @param {{ amount?: string|number } | null} parsedData
 * @returns {string} Total formateado con 2 decimales (ej. "12.50")
 */
export function getDisplayTotal(scannedItems = [], parsedData = null) {
  const itemsTotal = sumItems(scannedItems);
  if (itemsTotal > 0) {
    return itemsTotal.toFixed(2);
  }
  if (parsedData?.amount) {
    const parsedVal = parseFloat(parsedData.amount);
    if (!isNaN(parsedVal) && parsedVal > 0) {
      return parsedVal.toFixed(2);
    }
  }
  return "0.00";
}

/**
 * Genera un identificador único seguro (crypto.randomUUID con fallback).
 * @returns {string}
 */
export function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9);
}
