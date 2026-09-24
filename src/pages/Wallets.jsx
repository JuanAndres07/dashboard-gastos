import { useState } from "react";
import { useWalletContext } from "../contexts/WalletContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { WalletCard } from "../components/wallets/WalletCard";
import { WalletFormModal } from "../components/wallets/WalletFormModal";
import { TransferModal } from "../components/wallets/TransferModal";
import { WalletsHeader } from "../components/wallets/WalletsHeader";
import { CurrencySummaryCards } from "../components/wallets/CurrencySummaryCards";
import { WalletTypeFilter } from "../components/wallets/WalletTypeFilter";
import { WalletsEmptyState } from "../components/wallets/WalletsEmptyState";
import { formatCurrency } from "../utilities/formatters";

export default function Wallets({ user }) {
  const {
    wallets,
    balancesByCurrency,
    loading,
    createWallet,
    updateWallet,
    archiveWallet,
    executeTransfer,
  } = useWalletContext();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [transferFromWallet, setTransferFromWallet] = useState(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");

  const confirm = useConfirm();

  const handleEdit = (wallet) => {
    setEditingWallet(wallet);
    setIsFormModalOpen(true);
  };

  const handleTransfer = (wallet = null) => {
    setTransferFromWallet(wallet);
    setIsTransferModalOpen(true);
  };

  const handleArchive = async (wallet) => {
    const hasBalance = Number(wallet.balance) !== 0;
    const balanceWarning = hasBalance
      ? `\n\n⚠️ Esta cartera tiene un saldo disponible de ${formatCurrency(wallet.balance, wallet.currency)}. Al archivarla, este saldo dejará de sumarse en los totales activos consolidados.`
      : "";

    const isConfirmed = await confirm({
      title: "Archivar Cartera",
      message: `¿Estás seguro de archivar la cartera "${wallet.name}"? Los movimientos históricos se conservarán intactos pero no podrás seleccionarla para nuevos registros.${balanceWarning}`,
      confirmText: "Archivar",
      cancelText: "Cancelar",
      type: "danger",
    });

    if (isConfirmed) {
      await archiveWallet(wallet.id);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingWallet) {
      return await updateWallet(editingWallet.id, formData);
    }
    return await createWallet(formData);
  };

  const filteredWallets = wallets.filter((w) => {
    if (selectedTypeFilter === "all") return true;
    return w.type === selectedTypeFilter;
  });

  return (
    <div className="w-full space-y-6 text-left">
      <WalletsHeader
        onNewWallet={() => {
          setEditingWallet(null);
          setIsFormModalOpen(true);
        }}
        onTransfer={() => handleTransfer(null)}
        canTransfer={wallets.length >= 2}
      />

      <CurrencySummaryCards
        balancesByCurrency={balancesByCurrency}
        wallets={wallets}
      />

      <div
        className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out space-y-6"
        style={{ border: "var(--card-border)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-(--headings-color)">
            Cuentas y Carteras ({wallets.length})
          </h2>

          <WalletTypeFilter
            selectedType={selectedTypeFilter}
            onSelectType={setSelectedTypeFilter}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
            <span className="text-sm font-medium text-(--text-color)">Cargando carteras...</span>
          </div>
        ) : filteredWallets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onTransfer={handleTransfer}
              />
            ))}
          </div>
        ) : (
          <WalletsEmptyState
            onNewWallet={() => {
              setEditingWallet(null);
              setIsFormModalOpen(true);
            }}
          />
        )}
      </div>

      <WalletFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingWallet(null);
        }}
        onSubmit={handleFormSubmit}
        walletToEdit={editingWallet}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferFromWallet(null);
        }}
        onSubmit={executeTransfer}
        wallets={wallets}
        initialFromWallet={transferFromWallet}
        user={user}
      />
    </div>
  );
}
