import { useState, useEffect, useCallback, useMemo } from "react";
import { walletService } from "../services/walletService";
import { transferService } from "../services/transferService";
import { toast } from "sonner";
import { translateSupabaseError } from "../utilities/supabaseErrors";

export function useWallets(user) {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchWallets = useCallback(async () => {
    if (!user?.id) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await walletService.getWalletsWithBalances(user.id);
      if (fetchErr) throw fetchErr;
      setWallets(data || []);
    } catch (err) {
      console.error("Error cargando carteras:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets, refreshTrigger]);

  const refetch = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Total acumulado por cada moneda activa (Estrategia A)
  const balancesByCurrency = useMemo(() => {
    const map = {};
    wallets.forEach((w) => {
      const curr = w.currency || "USD";
      if (!map[curr]) {
        map[curr] = 0;
      }
      map[curr] += Number(w.balance) || 0;
    });
    return map;
  }, [wallets]);

  const handleCreateWallet = async (walletData) => {
    if (!user?.id) return { success: false };
    try {
      const { data, error: createError } = await walletService.createWallet(user.id, walletData);
      if (createError) {
        toast.error("Error al crear cartera: " + translateSupabaseError(createError));
        return { success: false, error: createError };
      }
      toast.success("Cartera creada con éxito");
      refetch();
      return { success: true, data };
    } catch (err) {
      toast.error("Error inesperado al crear cartera");
      return { success: false, error: err };
    }
  };

  const handleUpdateWallet = async (walletId, updates) => {
    if (!user?.id) return { success: false };
    try {
      const { data, error: updateError } = await walletService.updateWallet(user.id, walletId, updates);
      if (updateError) {
        toast.error("Error al actualizar cartera: " + translateSupabaseError(updateError));
        return { success: false, error: updateError };
      }
      toast.success("Cartera actualizada con éxito");
      refetch();
      return { success: true, data };
    } catch (err) {
      toast.error("Error inesperado al actualizar cartera");
      return { success: false, error: err };
    }
  };

  const handleArchiveWallet = async (walletId) => {
    if (!user?.id) return { success: false };
    try {
      const { error: archiveError } = await walletService.archiveWallet(user.id, walletId);
      if (archiveError) {
        toast.error("Error al archivar cartera: " + translateSupabaseError(archiveError));
        return { success: false, error: archiveError };
      }
      toast.success("Cartera archivada correctamente");
      refetch();
      return { success: true };
    } catch (err) {
      toast.error("Error inesperado al archivar cartera");
      return { success: false, error: err };
    }
  };

  const handleExecuteTransfer = async (transferParams) => {
    if (!user?.id) return { success: false };
    try {
      const result = await transferService.executeTransfer(user.id, transferParams);
      if (!result.success) {
        toast.error("Error en la transferencia: " + (result.error?.message || "Ocurrió un error"));
        return result;
      }
      toast.success("¡Transferencia realizada con éxito!");
      refetch();
      return result;
    } catch (err) {
      toast.error("Error inesperado al realizar transferencia");
      return { success: false, error: err };
    }
  };

  return {
    wallets,
    loading,
    error,
    balancesByCurrency,
    refetch,
    createWallet: handleCreateWallet,
    updateWallet: handleUpdateWallet,
    archiveWallet: handleArchiveWallet,
    executeTransfer: handleExecuteTransfer,
  };
}
