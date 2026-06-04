import { formatCurrency } from "../utilities/formatters";

export function TransactionTable({ transactions, loading, viewMode, setViewMode }) {
  return (
    <div className="w-full flex flex-col">
      <div className="flex bg-(--bg-light) p-1 rounded-xl gap-1 w-fit mb-6">
        <button 
          type="button"
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
            viewMode === "expense" 
              ? "bg-(--danger-color) text-white shadow-md shadow-danger/10" 
              : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
          }`}
          onClick={() => setViewMode("expense")}
        >
          Gastos
        </button>
        <button 
          type="button"
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
            viewMode === "income" 
              ? "bg-(--success-color) text-white shadow-md shadow-success/10" 
              : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
          }`}
          onClick={() => setViewMode("income")}
        >
          Ingresos
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium text-(--text-color)">Cargando movimientos...</span>
        </div>
      ) : transactions.length > 0 ? (
        <div className="overflow-x-auto w-full -mx-6 sm:mx-0">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-(--bg-light)/50">
              <tr className="border-b border-(--sidebar-border)">
                <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--sidebar-border)/40">
              {transactions.map((t) => (
                <tr 
                  key={t.id}
                  className="hover:bg-(--sidebar-link-hover-bg)/30 transition-all duration-200 ease-in-out"
                >
                  <td className="px-6 py-4 text-(--text-color) whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-(--headings-color) font-medium">
                    {t.note || <span className="italic text-(--text-color)/40 font-normal">Sin descripción</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-(--sidebar-link-hover-bg) text-(--primary-color)">
                      {t.Category?.name || "General"}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${
                    t.type === "expense" ? "text-(--danger-color)" : "text-(--success-color)"
                  }`}>
                    {t.type === "expense" ? "-" : "+"}
                    {formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {transactions.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-(--bg-light) flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105">
            <svg className="w-8 h-8 text-(--text-color)/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 12H4M20 12a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-(--headings-color) mb-1">Sin movimientos</h3>
          <p className="text-sm text-(--text-color)/70 max-w-xs">No hay transacciones registradas para este periodo o categoría.</p>
        </div>
      )}
    </div>
  );
}
