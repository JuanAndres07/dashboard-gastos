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
