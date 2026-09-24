import { formatCurrency } from "../../utilities/formatters";
import { CURRENCIES } from "../../constants/currencies";

export function CurrencySummaryCards({ balancesByCurrency = {}, wallets = [] }) {
  const activeCurrencyKeys = Object.keys(balancesByCurrency).filter(
    (cur) => balancesByCurrency[cur] !== 0 || wallets.some((w) => w.currency === cur)
  );

  if (activeCurrencyKeys.length === 0) {
    return (
      <div
        className="bg-(--settings-card-bg) rounded-2xl p-5 border text-center text-xs text-(--text-color)/70"
        style={{ border: "var(--card-border)" }}
      >
        Crea tu primera cartera para comenzar a ver tus saldos consolidados por divisa.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeCurrencyKeys.map((curr) => {
        const curInfo = CURRENCIES[curr] || CURRENCIES.USD;
        const total = balancesByCurrency[curr] || 0;
        return (
          <div
            key={curr}
            className="bg-(--settings-card-bg) rounded-2xl p-5 border transition-all duration-300 hover:shadow-md"
            style={{ border: "var(--card-border)" }}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{curInfo.flag}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-(--text-color)/70">
                  Total en {curInfo.name}
                </span>
              </div>
              <span className="text-xs font-bold text-(--primary-color) bg-(--sidebar-link-hover-bg) px-2 py-0.5 rounded-md border border-(--sidebar-border)/50">
                {curr}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-(--headings-color) tracking-tight">
              {formatCurrency(total, curr)}
            </h3>
          </div>
        );
      })}
    </div>
  );
}
