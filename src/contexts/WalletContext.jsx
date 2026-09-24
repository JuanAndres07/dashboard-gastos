import { createContext, useContext, useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useWallets } from "../hooks/useWallets";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const walletHook = useWallets(user);
  const [activeWalletId, setActiveWalletId] = useState(""); // "" significa todas las carteras

  const activeWallet = useMemo(() => {
    if (!activeWalletId) return null;
    return walletHook.wallets.find((w) => w.id === activeWalletId) || null;
  }, [activeWalletId, walletHook.wallets]);

  const activeCurrency = useMemo(() => {
    return activeWallet ? activeWallet.currency : "USD";
  }, [activeWallet]);

  const value = {
    ...walletHook,
    activeWalletId,
    setActiveWalletId,
    activeWallet,
    activeCurrency,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext debe usarse dentro de un WalletProvider");
  }
  return context;
}
