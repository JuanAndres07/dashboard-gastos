import { IconPlus, IconArrowsExchange } from "@tabler/icons-react";

export function WalletsHeader({ onNewWallet, onTransfer, canTransfer }) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">
          Mis Carteras
        </h1>
        <p className="text-sm text-(--text-color)/85 mt-1">
          Administra tus cuentas bancarias, billeteras en divisas y criptoactivos.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onTransfer}
          disabled={!canTransfer}
          className="flex items-center gap-2 bg-(--sidebar-link-hover-bg) hover:bg-(--primary-color)/10 text-(--primary-color) font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 ease-in-out cursor-pointer shrink-0 border border-(--primary-color)/20 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!canTransfer ? "Necesitas al menos 2 carteras para transferir" : "Transferir entre cuentas"}
        >
          <IconArrowsExchange size={18} />
          <span>Transferir</span>
        </button>

        <button
          onClick={onNewWallet}
          className="flex items-center gap-2 bg-(--primary-color) text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] cursor-pointer shrink-0"
        >
          <IconPlus size={18} />
          <span>Nueva Cartera</span>
        </button>
      </div>
    </header>
  );
}
