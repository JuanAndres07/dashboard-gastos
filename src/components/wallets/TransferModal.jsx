import Modal from "../Modal";
import Select from "../Select";
import DateInput from "../DateInput";
import { formatCurrency } from "../../utilities/formatters";
import { TransferSummaryPreview } from "./TransferSummaryPreview";
import { useTransferForm } from "../../hooks/useTransferForm";

export function TransferModal({
  isOpen,
  onClose,
  onSubmit,
  wallets = [],
  initialFromWallet = null,
  user,
}) {
  const {
    fromWalletId,
    toWalletId,
    setToWalletId,
    fromWallet,
    toWallet,
    amountFrom,
    amountTo,
    setAmountTo,
    fee,
    setFee,
    feeCategoryId,
    setFeeCategoryId,
    note,
    setNote,
    date,
    setDate,
    loading,
    expenseCategories,
    isSameCurrency,
    computedExchangeRate,
    handleAmountFromChange,
    handleFromWalletChange,
    handleSubmit,
  } = useTransferForm({
    isOpen,
    onClose,
    onSubmit,
    wallets,
    initialFromWallet,
    user,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transferencia entre Carteras"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Selector de Cartera Origen y Destino */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-color) tracking-wide">
              Desde (Origen)
            </label>
            <Select
              value={fromWalletId}
              onChange={handleFromWalletChange}
              options={wallets.map((w) => ({
                value: w.id,
                label: `${w.name} (${formatCurrency(w.balance, w.currency)})`,
              }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-color) tracking-wide">
              Hacia (Destino)
            </label>
            <Select
              value={toWalletId}
              onChange={setToWalletId}
              options={wallets
                .filter((w) => w.id !== fromWalletId)
                .map((w) => ({
                  value: w.id,
                  label: `${w.name} (${formatCurrency(w.balance, w.currency)})`,
                }))}
            />
          </div>
        </div>

        {/* Montos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-color) tracking-wide">
              Monto a Enviar ({fromWallet?.currency || "USD"})
            </label>
            <input
              type="number"
              step="0.0001"
              required
              placeholder="0.00"
              value={amountFrom}
              onChange={(e) => handleAmountFromChange(e.target.value)}
              className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-color) tracking-wide">
              Monto a Recibir ({toWallet?.currency || "USD"})
            </label>
            <input
              type="number"
              step="0.0001"
              required
              placeholder="0.00"
              value={amountTo}
              disabled={isSameCurrency}
              onChange={(e) => setAmountTo(e.target.value)}
              className={`w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 ${
                isSameCurrency ? "opacity-75 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>

        {/* Comisión / Fee Opcional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-color) tracking-wide">
              Comisión del Servicio ({fromWallet?.currency || "USD"})
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.00"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-color) tracking-wide">
              Categoría del Gasto (Comisión)
            </label>
            <Select
              value={feeCategoryId}
              onChange={setFeeCategoryId}
              disabled={!fee || Number(fee) <= 0}
              placeholder="Ej. Comisiones y Servicios"
              options={[
                { value: "", label: "Sin categoría específica" },
                ...expenseCategories.map((c) => ({
                  value: c.id,
                  label: c.name,
                })),
              ]}
            />
          </div>
        </div>

        {/* Fecha y Nota */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-color) tracking-wide">
              Fecha de la Operación
            </label>
            <DateInput
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-color) tracking-wide">
              Nota / Concepto (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Cambio P2P Binance, Recarga Zinli..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
            />
          </div>
        </div>

        {/* Resumen Visual del Asiento y Tasa */}
        <TransferSummaryPreview
          fromWallet={fromWallet}
          toWallet={toWallet}
          amountFrom={amountFrom}
          amountTo={amountTo}
          fee={fee}
          computedExchangeRate={computedExchangeRate}
          isSameCurrency={isSameCurrency}
        />

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
            disabled={loading || wallets.length < 2}
            className="flex-1 py-3 bg-(--primary-color) text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-[0_4px_12px_rgba(0,82,204,0.15)] disabled:opacity-50"
          >
            {loading ? "Transfiriendo..." : "Confirmar Transferencia"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
