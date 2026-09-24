import { supabase } from "../lib/supabase";

/**
 * Capa de Servicios de Dominio para Carteras (Wallets)
 * Principio Clean Code: Desacoplamiento de lógica de base de datos de los componentes React.
 */

export const walletService = {
  /**
   * Obtiene todas las carteras activas de un usuario.
   */
  async getWallets(userId, { includeArchived = false } = {}) {
    try {
      let query = supabase
        .from("Wallet")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (!includeArchived) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error al obtener carteras:", error);
      return { data: [], error };
    }
  },

  /**
   * Obtiene todas las carteras junto con su saldo real calculado directamente en PostgreSQL
   * mediante la función RPC get_wallets_with_balances (con precisión NUMERIC(19, 4)).
   */
  async getWalletsWithBalances(userId) {
    try {
      const { data, error } = await supabase.rpc("get_wallets_with_balances", {
        p_user_id: userId,
      });

      if (error) throw error;

      const enrichedWallets = (data || []).map((w) => ({
        ...w,
        balance: Number(w.balance) || 0,
      }));

      return { data: enrichedWallets, error: null };
    } catch (error) {
      console.error("Error al obtener carteras con saldo desde RPC:", error);
      return { data: [], error };
    }
  },

  /**
   * Crea una nueva cartera y, si se especificó saldo inicial > 0,
   * crea atómicamente la transacción de apertura inmutable (is_transfer = true).
   */
  async createWallet(userId, { name, type, currency, color, icon, initialBalance = 0 }) {
    try {
      // 1. Crear el registro en Wallet
      const { data: walletData, error: walletError } = await supabase
        .from("Wallet")
        .insert([
          {
            user_id: userId,
            name: name.trim(),
            type,
            currency,
            color: color || "#3b82f6",
            icon: icon || "IconWallet",
            is_active: true,
          },
        ])
        .select()
        .single();

      if (walletError) throw walletError;

      // 2. Si tiene saldo inicial > 0, crear el Asiento de Apertura en Transaction
      const numInitial = Number(initialBalance);
      if (numInitial > 0) {
        const today = new Date().toISOString().split("T")[0];
        const { error: initialTxError } = await supabase
          .from("Transaction")
          .insert([
            {
              user_id: userId,
              wallet_id: walletData.id,
              type: "income",
              amount: numInitial,
              currency: walletData.currency,
              is_transfer: true, // No cuenta como sueldo/ingreso operativo del mes
              note: `Saldo inicial - ${walletData.name}`,
              transaction_date: today,
            },
          ]);

        if (initialTxError) {
          console.error("Falla en asiento de apertura. Ejecutando rollback de cartera...", initialTxError);
          // Rollback atómico: eliminar la cartera creada para no dejar registros corruptos
          await supabase.from("Wallet").delete().eq("id", walletData.id).eq("user_id", userId);
          throw initialTxError;
        }
      }

      return { data: walletData, error: null };
    } catch (error) {
      console.error("Error al crear cartera:", error);
      return { data: null, error };
    }
  },

  /**
   * Actualiza la metadata de una cartera existente.
   */
  async updateWallet(userId, walletId, updates) {
    try {
      const allowedUpdates = {
        name: updates.name?.trim(),
        type: updates.type,
        color: updates.color,
        icon: updates.icon,
        is_active: updates.is_active,
        updated_at: new Date().toISOString(),
      };

      // Limpiar undefined
      Object.keys(allowedUpdates).forEach(
        (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
      );

      const { data, error } = await supabase
        .from("Wallet")
        .update(allowedUpdates)
        .eq("id", walletId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error al actualizar cartera:", error);
      return { data: null, error };
    }
  },

  /**
   * Archiva una cartera (Soft Delete) para preservar la inmutabilidad de los registros históricos.
   */
  async archiveWallet(userId, walletId) {
    return this.updateWallet(userId, walletId, { is_active: false });
  },
};
