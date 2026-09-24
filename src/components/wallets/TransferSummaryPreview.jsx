import { formatCurrency } from "../../utilities/formatters";
import { IconArrowRight } from "@tabler/icons-react";

export function TransferSummaryPreview({
  fromWallet,
  toWallet,
  amountFrom,
  amountTo,
  fee,
  computedExchangeRate,
  isSameCurrency,
}) {
  const numFrom = Number(amountFrom);
  const numTo = Number(amountTo);
  const numFee = Number(fee) || 0;

  return (
    <div className="space-y-3">
      {/* Indicador de Tasa de Cambio */}
      {!isSameCurrency && computedExchangeRate && fromWallet && toWallet && (
        <div className="p-3 bg-(--bg-light) rounded-xl border border-(--sidebar-border) flex items-center justify-between text-xs text-(--text-color)">
          <span className="font-semibold">Tasa de cambio implícita:</span>
          <span className="font-bold text-(--headings-color)">
            1 {toWallet.currency} = {computedExchangeRate} {fromWallet.currency}
          </span>
        </div>
      )}

      {/* Resumen Visual del Asiento */}
      {fromWallet && toWallet && (numFrom > 0 || numTo > 0) && (
        <div className="p-3.5 bg-(--primary-color)/5 rounded-xl border border-(--primary-color)/20 space-y-2 text-xs">
          <span className="font-bold text-(--headings-color) block">Resumen del movimiento:</span>
          <div className="flex items-center justify-between">
            <span className="text-(--danger-color) font-semibold">
              - {formatCurrency(numFrom + numFee, fromWallet.currency)} ({fromWallet.name})
            </span>
            <IconArrowRight size={14} className="text-(--text-color)/50" />
            <span className="text-(--success-color) font-semibold">
              + {formatCurrency(numTo, toWallet.currency)} ({toWallet.name})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
