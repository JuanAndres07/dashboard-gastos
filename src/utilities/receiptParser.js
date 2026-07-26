/**
 * Extrae el monto total, la descripción/comercio, la fecha y el texto crudo a partir del texto OCR.
 * Adaptado específicamente para facturas y recibos de Venezuela (SENIAT, RIF, Bs., Bolívares, USD/REF, IGTF, IVA).
 * 
 * @param {string} text Texto crudo devuelto por Tesseract.js
 * @returns {{ amount: string, description: string, date: string, rawText: string }}
 */
export function parseReceiptData(text) {
  if (!text) {
    return { amount: "", description: "Gasto escaneado", date: "", rawText: "" };
  }

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let amount = "";
  let description = "";
  let date = "";

  // 1. Extraer Descripción / Comercio (Ignorando metadatos fiscales de Venezuela como RIF, SENIAT, Impresora Fiscal, etc.)
  const ignoredKeywords = [
    "factura",
    "ticket",
    "recibo",
    "comprobante",
    "rif",
    "r.i.f",
    "seniat",
    "maquina fiscal",
    "impresora fiscal",
    "cuit",
    "nit",
    "tel",
    "telefono",
    "fecha",
    "direccion",
    "dir",
    "sucursal",
    "nro",
    "serie",
    "caja",
  ];

  const potentialTitles = lines.filter((line) => {
    const lower = line.toLowerCase();
    return (
      line.length >= 3 &&
      !ignoredKeywords.some((kw) => lower.includes(kw)) &&
      !/^(J|V|G|E|P)[-]?\d{8}[-]?\d$/i.test(line) && // RIF venezolano (ej. J-12345678-9)
      !/^\d+$/.test(line) &&
      !/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(line)
    );
  });

  if (potentialTitles.length > 0) {
    description = potentialTitles[0].replace(/[^\w\s\.\-&áéíóúÁÉÍÓÚñÑ]/g, "").trim();
  } else if (lines.length > 0) {
    description = lines[0].trim();
  }

  // 2. Extraer Fecha (Formatos comunes DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
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

      const parsedMonth = parseInt(month, 10);
      const parsedDay = parseInt(day, 10);
      if (parsedMonth >= 1 && parsedMonth <= 12 && parsedDay >= 1 && parsedDay <= 31) {
        date = `${year}-${month}-${day}`;
        break;
      }
    }
  }

  // 3. Extraer Monto Total
  // Palabras clave de Venezuela: TOTAL BS, TOTAL BS., TOTAL REF, TOTAL USD, TOTAL A PAGAR, TOTAL, MONTO TOTAL
  const totalKeywords = [
    "total bs",
    "total bs.",
    "total bolivares",
    "total apagar",
    "total pagar",
    "importe total",
    "total ref",
    "total usd",
    "total $",
    "monto total",
    "total general",
    "neto apagar",
    "total",
    "bs.",
    "bs",
    "ref",
    "$",
  ];

  let foundAmountFromKeyword = null;

  for (const line of lines) {
    const lower = line.toLowerCase().replace(/\s+/g, " ");

    // Ignorar subtotal, IVA, IGTF, Base Imponible o Exento a menos que la línea especifique TOTAL
    const isTaxOrSubtotalOnly =
      (lower.includes("subtotal") ||
        lower.includes("iva") ||
        lower.includes("igtf") ||
        lower.includes("base imponible") ||
        lower.includes("exento")) &&
      !lower.includes("total");

    if (isTaxOrSubtotalOnly) continue;

    if (totalKeywords.some((kw) => kw && lower.includes(kw))) {
      // Extraer patrones de números (Formatos 1.234,56 o 1234.56 o 50,00)
      const matches = line.match(/(?:Bs\.?|BS|REF\.?|\$|USD)?\s*(\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi);
      if (matches) {
        const parsedNums = matches
          .map((m) => {
            const clean = m.replace(/[^\d.,]/g, "");
            if (clean.includes(",") && clean.includes(".")) {
              return parseFloat(clean.replace(/\./g, "").replace(",", "."));
            } else if (clean.includes(",")) {
              return parseFloat(clean.replace(",", "."));
            }
            return parseFloat(clean);
          })
          .filter((n) => !isNaN(n) && n > 0);

        if (parsedNums.length > 0) {
          foundAmountFromKeyword = Math.max(...parsedNums);
          break;
        }
      }
    }
  }

  if (foundAmountFromKeyword !== null) {
    amount = foundAmountFromKeyword.toString();
  } else {
    // Si no encuentra por palabras clave, buscar los montos con decimales y seleccionar el mayor
    const allMatches = text.match(/\d+(?:[.,]\d{2})/g);
    if (allMatches && allMatches.length > 0) {
      const numbers = allMatches
        .map((m) => parseFloat(m.replace(",", ".")))
        .filter((n) => !isNaN(n) && n > 0);
      if (numbers.length > 0) {
        amount = Math.max(...numbers).toString();
      }
    }
  }

  return {
    amount: amount || "",
    description: description || "Gasto escaneado",
    date: date || "",
    rawText: text,
  };
}
