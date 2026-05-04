import { formatCurrency } from "../utilities/formatters";

export function TransactionTable({ transactions, loading, viewMode, setViewMode }) {
  return (
    <div>
      <div className="mb-3 d-flex gap-2 p-3">
        <button 
          className={`btn ${viewMode === "expense" ? "btn-danger" : "btn-outline-danger"}`}
          onClick={() => setViewMode("expense")}
        >
          Gastos
        </button>
        <button 
          className={`btn ${viewMode === "income" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setViewMode("income")}
        >
          Ingresos
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-center">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          <span>Cargando movimientos...</span>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th className="text-end">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td>{t.note || "Sin descripción"}</td>
                  <td>{t.Category?.name}</td>
                  <td className={`text-end fw-bold ${t.type === "expense" ? "text-danger" : "text-success"}`}>
                    {t.type === "expense" ? "-" : "+"}
                    {formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {transactions.length === 0 && !loading && (
        <div className="p-5 text-center text-muted">
          <i className="bi bi-inbox fs-2 d-block mb-2"></i>
          <p>No hay movimientos para mostrar</p>
        </div>
      )}
    </div>
  );
}
