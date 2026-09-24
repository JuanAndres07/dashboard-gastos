import { supabase } from "../lib/supabase";

/**
 * Capa de Servicios para Transferencias entre Carteras (Patrón de Partida Doble)
 * Principio Clean Code: Operaciones atómicas con transacciones gemelas / tripartitas.
 */

export const transferService = {
  /**
   * Ejecuta una transferencia atómica entre dos carteras (con soporte para comisiones y multimoneda).
   * Genera 2 o 3 filas en Transaction compartiendo el mismo transfer_id.
   */
  async executeTransfer(userId, {
    fromWallet,
    toWallet,
    amountFrom,
    amountTo,
    fee = 0,
    exchangeRate = 1.0,
    note = "",
    date = new Date().toISOString().split("T")[0],
    feeCategoryId = null,
  }) {
    try {
      if (!fromWallet?.id || !toWallet?.id) {
        throw new Error("Se requieren ambas carteras para ejecutar la transferencia.");
      }

      if (fromWallet.id === toWallet.id) {
        throw new Error("La cartera de origen y destino no pueden ser la misma.");
      }

      const numFrom = Number(amountFrom);
      const numTo = Number(amountTo);
      const numFee = Number(fee) || 0;

      if (numFrom <= 0 || numTo <= 0) {
        throw new Error("Los montos deben ser mayores a cero.");
      }

      const transferId = crypto.randomUUID();
      const rowsToInsert = [];

      // 1. Fila de Egreso (Cartera Origen)
      rowsToInsert.push({
        user_id: userId,
        wallet_id: fromWallet.id,
        related_wallet_id: toWallet.id,
        type: "expense",
        amount: numFrom,
        currency: fromWallet.currency,
        transfer_id: transferId,
        is_transfer: true, // No cuenta como gasto de vida en reportes
        exchange_rate: Number(exchangeRate) || 1.0,
        note: note ? `${note} (A ${toWallet.name})` : `Transferencia a ${toWallet.name}`,
        transaction_date: date,
      });

      // 2. Fila de Ingreso (Cartera Destino)
      rowsToInsert.push({
        user_id: userId,
        wallet_id: toWallet.id,
        related_wallet_id: fromWallet.id,
        type: "income",
        amount: numTo,
        currency: toWallet.currency,
        transfer_id: transferId,
        is_transfer: true, // No cuenta como sueldo o ganancia operativa
        exchange_rate: Number(exchangeRate) || 1.0,
        note: note ? `${note} (Desde ${fromWallet.name})` : `Transferencia desde ${fromWallet.name}`,
        transaction_date: date,
      });

      // 3. Fila de Comisión / Fee Operativo (Si aplica)
      if (numFee > 0) {
        rowsToInsert.push({
          user_id: userId,
          wallet_id: fromWallet.id,
          type: "expense",
          amount: numFee,
          currency: fromWallet.currency,
          category_id: feeCategoryId,
          transfer_id: transferId,
          is_transfer: false, // ¡Es un gasto real operativo y debe figurar en reportes!
          note: `Comisión de transferencia a ${toWallet.name}`,
          transaction_date: date,
        });
      }

      // Inserción atómica en bloque
      const { data, error } = await supabase
        .from("Transaction")
        .insert(rowsToInsert)
        .select();

      if (error) throw error;
      return { success: true, transferId, data, error: null };
    } catch (error) {
      console.error("Error al ejecutar transferencia:", error);
      return { success: false, error };
    }
  },

  /**
   * Elimina una transferencia completa (elimina atómicamente todas las filas gemelas asociadas al transfer_id).
   */
  async deleteTransfer(userId, transferId) {
    try {
      if (!transferId) throw new Error("ID de transferencia requerido.");

      const { data, error } = await supabase
        .from("Transaction")
        .delete()
        .eq("user_id", userId)
        .eq("transfer_id", transferId);

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Error al revertir transferencia:", error);
      return { success: false, error };
    }
  },
};
