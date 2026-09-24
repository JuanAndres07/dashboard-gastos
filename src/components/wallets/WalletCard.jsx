import { formatCurrency } from "../../utilities/formatters";
import { iconDictionary } from "../../utilities/iconDictionary";
import { WALLET_TYPES, CURRENCIES } from "../../constants/currencies";
import { IconDotsVertical, IconEdit, IconArchive, IconArrowsExchange } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";

export function WalletCard({
  wallet,
  onEdit,
  onArchive,
  onTransfer,
  isSelected = false,
  onClick,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const IconComponent = iconDictionary[wallet.icon] || iconDictionary.IconWallet;
  const walletType = WALLET_TYPES[wallet.type] || WALLET_TYPES.cash;
  const currencyInfo = CURRENCIES[wallet.currency] || CURRENCIES.USD;
  const color = wallet.color || walletType.defaultColor || "#3b82f6";

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const balance = Number(wallet.balance) || 0;
  const isPositive = balance >= 0;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ease-in-out border text-left cursor-pointer ${
        isSelected
          ? "ring-2 ring-(--primary-color) shadow-lg"
          : "hover:-translate-y-1 hover:shadow-md dark:hover:shadow-black/20"
      }`}
      style={{
        backgroundColor: "var(--settings-card-bg)",
        borderColor: isSelected ? "var(--primary-color)" : "var(--sidebar-border)",
      }}
    >
      {/* Luz ambiental sutil con el color de la cartera */}
      <div
        className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        {/* Icono e información */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105"
            style={{
              backgroundColor: `${color}18`,
              color: color,
            }}
          >
            <IconComponent size={22} stroke={1.75} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-(--headings-color) truncate" title={wallet.name}>
              {wallet.name}
            </h4>
            <span className="text-[11px] font-medium text-(--text-color)/70 block truncate">
              {walletType.label} • {currencyInfo.code}
            </span>
          </div>
        </div>

        {/* Menú de Opciones */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-lg text-(--text-color)/50 hover:text-(--headings-color) hover:bg-(--bg-light) transition-colors cursor-pointer"
            title="Opciones de cartera"
          >
            <IconDotsVertical size={16} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1 w-38 bg-(--settings-card-bg) rounded-xl shadow-xl border border-(--sidebar-border) py-1.5 z-30 animate-fadeIn"
              style={{ border: "var(--card-border)" }}
            >
              {onTransfer && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onTransfer(wallet);
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <IconArrowsExchange size={15} className="text-(--primary-color)" />
                  <span>Transferir</span>
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(wallet);
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <IconEdit size={15} className="text-(--text-color)/70" />
                  <span>Editar</span>
                </button>
              )}

              {onArchive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onArchive(wallet);
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#e11d48] hover:bg-[#fff1f2] dark:hover:bg-[#ef4444]/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <IconArchive size={15} />
                  <span>Archivar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Saldo de la Cartera */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-color)/60">
          Saldo Disponible
        </span>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <h3
            className={`text-2xl font-extrabold tracking-tight ${
              isPositive ? "text-(--headings-color)" : "text-(--danger-color)"
            }`}
          >
            {formatCurrency(balance, wallet.currency)}
          </h3>
        </div>
      </div>

      {/* Barra de acento inferior con el color de la cartera */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-75"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
