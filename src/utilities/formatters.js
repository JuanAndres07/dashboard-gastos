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


