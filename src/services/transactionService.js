import { supabase } from "../lib/supabase";

/**
 * Capa de Servicios de Dominio para Transacciones
 * Principio Clean Code: Desacoplamiento de la base de datos de los componentes React (SRP y DIP).
 */
export const transactionService = {
  /**
   * Crea una nueva transacción individual garantizando asignación de divisa y cartera.
   */
  async createTransaction(userId, {
    amount,
    note,
    categoryId,
    walletId,
    type,
    date,
    currency = "USD",
  }) {
    try {
      if (!userId) throw new Error("Usuario no autenticado");
      if (!walletId) throw new Error("Se requiere una cartera para registrar el movimiento");

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("El monto debe ser mayor a cero");
      }

      const { data, error } = await supabase
        .from("Transaction")
        .insert([
          {
            user_id: userId,
            wallet_id: walletId,
            category_id: categoryId || null,
            amount: numAmount,
            note: note ? note.trim() : "",
            type: type || "expense",
            currency: currency,
            transaction_date: date,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Error en createTransaction:", error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Actualiza una transacción existente.
   */
  async updateTransaction(userId, transactionId, {
    amount,
    note,
    categoryId,
    walletId,
    type,
    date,
    currency,
  }) {
    try {
      if (!userId || !transactionId) throw new Error("Parámetros requeridos ausentes");

      const updates = {
        amount: Number(amount),
        note: note ? note.trim() : "",
        category_id: categoryId || null,
        wallet_id: walletId,
        type: type,
        transaction_date: date,
      };

      if (currency) {
        updates.currency = currency;
      }

      const { data, error } = await supabase
        .from("Transaction")
        .update(updates)
        .eq("id", transactionId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Error en updateTransaction:", error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Elimina una transacción individual por su ID.
   */
  async deleteTransaction(userId, transactionId) {
    try {
      if (!userId || !transactionId) throw new Error("Parámetros requeridos ausentes");

      const { data, error } = await supabase
        .from("Transaction")
        .delete()
        .eq("id", transactionId)
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Error en deleteTransaction:", error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Inserta un lote de transacciones (usado comúnmente en escaneo de facturas).
   */
  async createBatchTransactions(userId, transactions = []) {
    try {
      if (!userId) throw new Error("Usuario no autenticado");
      if (!transactions || transactions.length === 0) return { success: true, count: 0 };

      const rows = transactions.map((t) => ({
        user_id: userId,
        wallet_id: t.wallet_id || t.walletId,
        category_id: t.category_id || t.categoryId || null,
        amount: Number(t.amount),
        note: t.note || t.description || "",
        type: t.type || "expense",
        currency: t.currency || "USD",
        transaction_date: t.transaction_date || t.date || new Date().toISOString().split("T")[0],
      }));

      const { data, error } = await supabase
        .from("Transaction")
        .insert(rows)
        .select();

      if (error) throw error;
      return { success: true, data, count: rows.length, error: null };
    } catch (error) {
      console.error("Error en createBatchTransactions:", error);
      return { success: false, data: null, count: 0, error };
    }
  },
};
