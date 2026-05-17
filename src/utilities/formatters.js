/**
 * Formatea un número como moneda USD.
 * @param {number|string} amount - El monto a formatear.
 * @returns {string} El monto formateado como moneda.
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "$0.00";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(Number(amount));
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

