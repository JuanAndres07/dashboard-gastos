import { IconPlus, IconWallet } from "@tabler/icons-react";

export function WalletsEmptyState({ onNewWallet }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-(--bg-light)/20 rounded-2xl border border-dashed border-(--sidebar-border)">
      <div className="w-14 h-14 rounded-2xl bg-(--bg-light) flex items-center justify-center mb-3">
        <IconWallet size={28} className="text-(--text-color)/50" />
      </div>
      <h3 className="text-base font-bold text-(--headings-color) mb-1">
        No tienes carteras registradas
      </h3>
      <p className="text-xs text-(--text-color)/80 max-w-xs mb-4">
        Crea tus cuentas bancarias, billeteras de dólares o cuentas cripto para organizar tus finanzas.
      </p>
      <button
        onClick={onNewWallet}
        className="flex items-center gap-2 bg-(--primary-color) text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all hover:opacity-90 cursor-pointer"
      >
        <IconPlus size={16} />
        <span>Crear mi primera cartera</span>
      </button>
    </div>
  );
}
