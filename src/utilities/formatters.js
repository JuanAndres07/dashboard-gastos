import { CURRENCIES } from "../constants/currencies";

/**
 * Formatea un número según su moneda (USD, VES, USDT, EUR, BTC, etc.).
 * @param {number|string} amount - El monto a formatear.
 * @param {string} [currency="USD"] - El código de la moneda.
 * @returns {string} El monto formateado con símbolo o sufijo correspondiente.
 */
export const formatCurrency = (amount, currency = "USD") => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    const cur = CURRENCIES[currency] || CURRENCIES.USD;
    return `${cur.prefix}0.00${cur.suffix}`;
  }

  const num = Number(amount);
  const curInfo = CURRENCIES[currency];

  // Si es una moneda estándar reconocida por Intl (USD, EUR, etc.)
  if (currency === "USD" || currency === "EUR") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  // Para Bolívares (VES / Bs.)
  if (currency === "VES") {
    const formatted = new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
    return `Bs. ${formatted}`;
  }

  // Para Criptomonedas como USDT, BTC o monedas personalizadas
  const decimals = curInfo?.decimals ?? 2;
  const formattedNum = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);

  if (curInfo) {
    return `${curInfo.prefix}${formattedNum}${curInfo.suffix}`;
  }

  return `${formattedNum} ${currency}`;
};

/**
 * Formatea un objeto Date en formato YYYY-MM-DD para inputs de HTML y base de datos.
 * @param {Date} date - El objeto fecha a formatear.
 * @returns {string} Fecha en formato YYYY-MM-DD.
 */
export const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parsea una cadena de fecha de forma segura. Si es YYYY-MM-DD, la parsea
 * en la zona horaria local para evitar desajustes de zona horaria (timezone shifts).
 * Si tiene hora (created_at), la parsea normalmente.
 * @param {string} dateStr - Cadena de fecha a parsear.
 * @returns {Date} Objeto Date resultante.
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  // Si tiene T o contiene hora, es un timestamp completo
  if (dateStr.includes("T") || dateStr.includes(" ")) {
    return new Date(dateStr);
  }
  
  // Formato YYYY-MM-DD
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  
  return new Date(dateStr);
};


