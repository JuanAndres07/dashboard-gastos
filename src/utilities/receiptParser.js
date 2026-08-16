import { generateId, sumItems } from "./scanTotals";

/**
 * Analizador y extractor estructurado para recibos y facturas fiscales.
 * Diseñado con alta tolerancia a variaciones de OCR, sufijos fiscales (E, G, *) y formatos multilínea.
 */

/**
 * Normaliza una cadena de texto para comparaciones.
 * @param {string} str
 * @returns {string}
 */
function cleanText(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Parsea un monto de texto a número flotante.
 * Maneja formatos: 1.234,56 / 1,234.56 / 1.234.56 / 1,234,56 / 1234,56 / 1234.56 / 50,00 / 50.00 / 1.000.000
 * @param {string} raw
 * @returns {number|null}
 */
export function parsePriceNumber(raw) {
  if (!raw) return null;
  // Extraer únicamente los dígitos, comas y puntos
  let str = raw.replace(/[^\d.,]/g, "").trim();
  if (!str) return null;

  // Limpiar separadores repetidos consecutivos (ej. 12..50 -> 12.50, 12,,50 -> 12,50)
  str = str.replace(/\.+/g, ".").replace(/,+/g, ",");

  if (str.includes(",") && str.includes(".")) {
    const lastComma = str.lastIndexOf(",");
    const lastDot = str.lastIndexOf(".");
    if (lastComma > lastDot) {
      // 1.234.567,89 -> 1234567.89
      const integerPart = str.slice(0, lastComma).replace(/[.,]/g, "");
      const decimalPart = str.slice(lastComma + 1).replace(/[.,]/g, "");
      str = `${integerPart}.${decimalPart}`;
    } else {
      // 1,234,567.89 -> 1234567.89
      const integerPart = str.slice(0, lastDot).replace(/[.,]/g, "");
      const decimalPart = str.slice(lastDot + 1).replace(/[.,]/g, "");
      str = `${integerPart}.${decimalPart}`;
    }
  } else if (str.includes(",")) {
    const parts = str.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      // 50,00 / 1234,56 -> 1234.56
      str = `${parts[0]}.${parts[1]}`;
    } else if (parts.length > 2 && parts[parts.length - 1].length <= 2) {
      // 1,234,56 -> 1234.56
      const last = parts[parts.length - 1];
      const rest = parts.slice(0, -1).join("");
      str = `${rest}.${last}`;
    } else {
      // 1,000,000 -> 1000000
      str = parts.join("");
    }
  } else if (str.includes(".")) {
    const parts = str.split(".");
    if (parts.length > 2) {
      if (parts[parts.length - 1].length <= 2) {
        // 1.234.56 / 1.000.00 -> 1234.56 / 1000.00
        const last = parts[parts.length - 1];
        const rest = parts.slice(0, -1).join("");
        str = `${rest}.${last}`;
      } else {
        // 1.000.000 -> 1000000
        str = parts.join("");
      }
    }
  }

  const num = parseFloat(str);
  return isNaN(num) || num <= 0 ? null : num;
}

/**
 * Patrones específicos de líneas que definitivamente NO son productos.
 */
const STRICT_EXCLUDE_PATTERNS = [
  /seniat/i,
  /maquina\s*fiscal/i,
  /impresora\s*fiscal/i,
  /nro\s*control/i,
  /numero\s*control/i,
  /serial\s*fiscal/i,
  /z\s*report/i,
  /pago\s*movil/i,
  /punto\s*de\s*venta/i,
  /tarjeta/i,
  /biopago/i,
  /transferencia/i,
  /gracias\s*por\s*su\s*compra/i,
  /vuelva\s*pronto/i,
  /no\s*valido\s*como\s*factura/i,
  /direccion/i,
  /telefono/i,
  /subtotal/i,
  /sub-total/i,
  /sub\s*total/i,
  /base\s*imponible/i,
  /base\s*imp/i,
  /monto\s*exento/i,
  /igtf/i,
  /total\s*a\s*pagar/i,
  /total\s*pagar/i,
  /total\s*general/i,
  /total\s*bs/i,
  /total\s*usd/i,
  /total\s*ref/i,
  /total\s*\$/i,
  /monto\s*total/i,
  /neto\s*a\s*pagar/i,
  /importe\s*total/i,
];

/**
 * Extrae el nombre del comercio a partir de las primeras líneas.
 * @param {string[]} lines
 * @returns {string}
 */
function extractMerchantName(lines) {
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i].trim();
    if (line.length < 3 || line.length > 50) continue;

    // Ignorar si es RIF
    if (/^[JVEGP][-]?\d{7,9}[-]?\d?$/i.test(line.replace(/\s+/g, ""))) continue;
    // Ignorar si coincide con líneas no deseadas
    if (STRICT_EXCLUDE_PATTERNS.some((p) => p.test(line))) continue;
    // Ignorar si es solo números, fechas o caracteres especiales
    if (/^[\d\s./:-]+$/.test(line)) continue;

    const sanitized = line.replace(/[^\w\s.&áéíóúÁÉÍÓÚñÑ-]/g, "").trim();
    if (sanitized.length >= 3) {
      return sanitized;
    }
  }
  return "Gasto escaneado";
}

/**
 * Extrae la fecha de la factura.
 * @param {string[]} lines
 * @returns {string}
 */
function extractReceiptDate(lines) {
  const dateRegex = /\b(\d{1,2})[-/.]([01]?\d)[-/.](20\d{2}|\d{2})\b|\b(20\d{2})[-/.]([01]?\d)[-/.](\d{1,2})\b/;

  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      let day, month, year;
      if (match[1]) {
        day = match[1].padStart(2, "0");
        month = match[2].padStart(2, "0");
        year = match[3].length === 2 ? `20${match[3]}` : match[3];
      } else {
        year = match[4];
        month = match[5].padStart(2, "0");
        day = match[6].padStart(2, "0");
      }

      const d = parseInt(day, 10);
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);

      if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2000 && y <= 2099) {
        return `${year}-${month}-${day}`;
      }
    }
  }

  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

/**
 * Extrae totales e impuestos fiscales (Subtotal, IVA, IGTF, Total Bs, Total USD).
 * @param {string[]} lines
 */
function extractFinancialTotals(lines) {
  let totalUSD = null;
  let totalVES = null;
  let detectedTotal = null;
  let subtotal = null;
  let taxAmount = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const clean = cleanText(line);

    // Buscar precios en la línea
    const priceMatches = line.match(/\b\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})\b/g) || [];
    const prices = priceMatches
      .map((p) => parsePriceNumber(p))
      .filter((p) => p !== null && p > 0);

    let priceValue = prices.length > 0 ? prices[prices.length - 1] : null;

    // Si la etiqueta fiscal está en una línea y el precio en la siguiente
    if (priceValue === null && i + 1 < lines.length) {
      const nextMatches = lines[i + 1].match(/\b\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})\b/g) || [];
      if (nextMatches.length > 0) {
        priceValue = parsePriceNumber(nextMatches[nextMatches.length - 1]);
      }
    }

    if (priceValue === null) continue;

    // Total en USD / REF
    if (
      clean.includes("total ref") ||
      clean.includes("total usd") ||
      clean.includes("total $") ||
      clean.includes("total divisas") ||
      (clean.includes("total") && (clean.includes("ref") || clean.includes("usd") || clean.includes("$")))
    ) {
      totalUSD = priceValue.toFixed(2);
    }

    // Total en Bs
    if (
      clean.includes("total bs") ||
      clean.includes("total bolivares") ||
      clean.includes("total general") ||
      clean.includes("total a pagar") ||
      clean.includes("monto total") ||
      clean.includes("neto a pagar") ||
      (clean.includes("total") && !clean.includes("subtotal") && !clean.includes("usd") && !clean.includes("ref"))
    ) {
      totalVES = priceValue.toFixed(2);
      if (!detectedTotal) detectedTotal = totalVES;
    }

    // Subtotal
    if (
      (clean.includes("subtotal") || clean.includes("sub-total") || clean.includes("base imponible") || clean.includes("bi g")) &&
      !clean.includes("iva") &&
      !clean.includes("total")
    ) {
      if (!subtotal) subtotal = priceValue.toFixed(2);
    }

    // IVA
    if (
      (clean.includes("iva") || clean.includes("i.v.a") || clean.includes("16%") || clean.includes("8%")) &&
      !clean.includes("base") &&
      !clean.includes("total")
    ) {
      if (!taxAmount) taxAmount = priceValue.toFixed(2);
    }
  }

  const primaryTotal = totalUSD || detectedTotal || (totalVES ? totalVES : "");

  return {
    totalAmount: primaryTotal,
    totalVES,
    totalUSD,
    subtotal,
    taxAmount,
  };
}

/**
 * Extrae los productos del cuerpo del ticket de forma tolerante a sufijos fiscales y saltos de línea.
 * @param {string[]} lines
 * @returns {Array<{ id: string, description: string, amount: string, quantity?: number, unitPrice?: string }>}
 */
function extractReceiptItems(lines) {
  const items = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 2) continue;

    // Descartar RIF
    if (/^[JVEGP][-]?\d{7,9}[-]?\d?$/i.test(line.replace(/\s+/g, ""))) continue;

    // Descartar si coincide con una línea de exclusión estricta
    if (STRICT_EXCLUDE_PATTERNS.some((p) => p.test(line))) continue;

    // Descartar si es solo una hora o fecha
    if (/^\d{1,2}[:.]\d{2}([:.]\d{2})?$/.test(line)) continue;
    if (/^\d{1,2}[-/. ]\d{1,2}[-/. ]\d{2,4}$/.test(line)) continue;

    // Caso 1: Línea con formato "2 x 15.00" o "1.000 x 42.50"
    const qtyMatch = line.match(/^(\d+(?:[.,]\d+)?)\s*[xX*]\s*(\d+[.,]\d{2})(?:\s*=?\s*(\d+[.,]\d{2}))?/);
    if (qtyMatch) {
      const qty = parseFloat(qtyMatch[1].replace(",", ".")) || 1;
      const unitPrice = parsePriceNumber(qtyMatch[2]);
      const lineTotal = parsePriceNumber(qtyMatch[3]) || (unitPrice ? unitPrice * qty : null);

      if (lineTotal !== null) {
        let desc = "Producto";
        if (i > 0) {
          const prevLine = lines[i - 1].trim();
          if (
            prevLine.length >= 2 &&
            !STRICT_EXCLUDE_PATTERNS.some((p) => p.test(prevLine)) &&
            !/\b\d+[.,]\d{2}\b/.test(prevLine)
          ) {
            desc = prevLine.replace(/[^\w\s.&áéíóúÁÉÍÓÚñÑ-]/g, "").trim();
          }
        }

        items.push({
          id: generateId(),
          description: desc,
          amount: lineTotal.toFixed(2),
          quantity: qty,
          unitPrice: unitPrice ? unitPrice.toFixed(2) : lineTotal.toFixed(2),
        });
        continue;
      }
    }

    // Caso 2: Línea con [Descripción] [Precio] [Sufijo opcional: (E), (G), G, E, *, Bs, $, REF, etc.]
    // Busca números decimales (ej. 45.00, 1.250,00, 3,50) en cualquier posición de la segunda mitad de la línea
    const priceMatches = [...line.matchAll(/\b(\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2}))\b/g)];
    if (priceMatches.length > 0) {
      // Tomar el último número decimal de la línea como el precio del producto
      const lastMatch = priceMatches[priceMatches.length - 1];
      const numVal = parsePriceNumber(lastMatch[1]);

      if (numVal !== null && numVal > 0) {
        // La descripción es todo lo que está antes del número del precio
        const textBeforePrice = line.substring(0, lastMatch.index).trim();
        let itemDesc = textBeforePrice
          .replace(/[^\w\s.&áéíóúÁÉÍÓÚñÑ-]/g, "")
          .replace(/^\d+\s*[xX]\s*/i, "")
          .trim();

        // Si la descripción está en la línea anterior (porque esta línea solo tenía el precio)
        if (itemDesc.length < 2 && i > 0) {
          const prevLine = lines[i - 1].trim();
          if (
            prevLine.length >= 2 &&
            !STRICT_EXCLUDE_PATTERNS.some((p) => p.test(prevLine)) &&
            !/\b\d+[.,]\d{2}\b/.test(prevLine)
          ) {
            itemDesc = prevLine.replace(/[^\w\s.&áéíóúÁÉÍÓÚñÑ-]/g, "").trim();
          }
        }

        if (itemDesc.length >= 2) {
          items.push({
            id: generateId(),
            description: itemDesc,
            amount: numVal.toFixed(2),
          });
        }
      }
    }
  }

  return items;
}

/**
 * Función principal para estructurar los datos leídos por OCR.
 * @param {string} text
 */
export function parseReceiptData(text) {
  if (!text || typeof text !== "string") {
    return {
      amount: "",
      subtotal: null,
      taxAmount: null,
      totalVES: null,
      totalUSD: null,
      description: "Gasto escaneado",
      date: new Date().toISOString().split("T")[0],
      items: [],
      hasDiscrepancy: false,
      rawText: "",
    };
  }

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Extraer Comercio
  const description = extractMerchantName(lines);

  // 2. Extraer Fecha
  const date = extractReceiptDate(lines);

  // 3. Extraer Totales e Impuestos Fiscales
  const totals = extractFinancialTotals(lines);

  // 4. Extraer Productos
  const extractedItems = extractReceiptItems(lines);

  // 5. Reconciliación matemática
  const totalSumItems = sumItems(extractedItems);

  let finalAmount = totals.totalAmount;

  if (!finalAmount && totalSumItems > 0) {
    finalAmount = totalSumItems.toFixed(2);
  }

  let defaultItems = extractedItems;
  if (defaultItems.length === 0 && finalAmount) {
    defaultItems = [
      {
        id: generateId(),
        description: description || "Gasto escaneado",
        amount: finalAmount,
      },
    ];
  }

  const totalNum = parseFloat(finalAmount) || 0;
  const hasDiscrepancy =
    extractedItems.length > 0 &&
    totalNum > 0 &&
    Math.abs(totalSumItems - totalNum) > 0.05;

  return {
    amount: finalAmount || "0.00",
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    totalVES: totals.totalVES,
    totalUSD: totals.totalUSD,
    description: description || "Gasto escaneado",
    date: date,
    items: defaultItems,
    hasDiscrepancy,
    rawText: text,
  };
}
