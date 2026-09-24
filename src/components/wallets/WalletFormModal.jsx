import Modal from "../Modal";
import Select from "../Select";
import IconPicker from "../IconPicker";
import { WALLET_TYPES, CURRENCIES } from "../../constants/currencies";
import { ColorPresetPicker } from "./ColorPresetPicker";
import { useWalletForm } from "../../hooks/useWalletForm";

export function WalletFormModal({
  isOpen,
  onClose,
  onSubmit,
  walletToEdit = null,
}) {
  const {
    name,
    setName,
    type,
    handleTypeChange,
    currency,
    setCurrency,
    initialBalance,
    setInitialBalance,
    color,
    setColor,
    icon,
    setIcon,
    loading,
    handleSubmit,
  } = useWalletForm({ walletToEdit, isOpen, onSubmit, onClose });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={walletToEdit ? "Editar Cartera" : "Crear Nueva Cartera"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Nombre de la cartera */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-(--text-color) tracking-wide">
            Nombre de la Cartera / Cuenta
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Banesco, PayPal, Zinli, Binance USDT..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
          />
        </div>

        {/* Tipo de Cartera */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-(--text-color) tracking-wide">
            Tipo de Activo
          </label>
          <Select
            value={type}
            onChange={handleTypeChange}
            options={Object.values(WALLET_TYPES).map((t) => ({
              value: t.id,
              label: t.label,
            }))}
          />
        </div>

        {/* Moneda */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-(--text-color) tracking-wide">
            Moneda Base
          </label>
          <Select
            value={currency}
            onChange={setCurrency}
            disabled={!!walletToEdit}
            options={Object.values(CURRENCIES).map((c) => ({
              value: c.code,
              label: `${c.flag} ${c.code} - ${c.name} (${c.symbol})`,
            }))}
          />
          {walletToEdit && (
            <span className="text-[11px] text-(--text-color)/60">
              La moneda base no puede modificarse una vez creada para preservar la integridad del historial.
            </span>
          )}
        </div>

        {/* Saldo Inicial (Solo al crear) */}
        {!walletToEdit && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-(--text-color) tracking-wide">
                Saldo Inicial Disponible (Opcional)
              </label>
              <span className="text-[11px] text-(--text-color)/60">
                {currency}
              </span>
            </div>
            <input
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.00"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
            />
            <p className="text-[11px] text-(--text-color)/70 leading-relaxed">
              💡 Se registrará como un asiento de apertura inmutable en tu historial contable.
            </p>
          </div>
        )}

        {/* Selector de Icono y Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-color) tracking-wide">
              Icono
            </label>
            <IconPicker
              value={icon}
              onChange={setIcon}
              className="w-full"
              btnClassName="w-full px-4 py-2.5 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
            />
          </div>

          <ColorPresetPicker color={color} onChange={setColor} />
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-sm transition-all duration-300 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-(--primary-color) text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-[0_4px_12px_rgba(0,82,204,0.15)] disabled:opacity-50"
          >
            {loading ? "Guardando..." : walletToEdit ? "Guardar Cambios" : "Crear Cartera"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
