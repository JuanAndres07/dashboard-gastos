import { useBudgets } from "../hooks/useBudgets";
import { formatCurrency } from "../utilities/formatters";

export default function Budgets({ user }) {
  const {
    formData,
    loading,
    message,
    setMessage,
    budgets,
    loadingBudgets,
    editingBudget,
    setEditingBudget,
    loadingEdit,
    editError,
    dateFilters,
    expenseCategories,
    loadingCategories,
    handleSubmit,
    handleEditSubmit,
    handleChange,
    handleFilterChange,
  } = useBudgets(user);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Presupuestos</h1>
      </div>

      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <h5 className="card-title mb-4">Crear Nuevo Presupuesto</h5>

          {message.text && (
            <div
              className={`alert alert-${message.type} alert-dismissible fade show`}
              role="alert"
            >
              {message.text}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage({ type: "", text: "" })}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label htmlFor="category_id" className="form-label">
                Categoría
              </label>
              <select
                id="category_id"
                name="category_id"
                className="form-select"
                value={formData.category_id}
                onChange={handleChange}
                required
                disabled={loadingCategories || loadingBudgets}
              >
                <option value="">
                  {loadingCategories || loadingBudgets
                    ? "Cargando categorías..."
                    : "Selecciona una categoría"}
                </option>
                {!loadingCategories &&
                  !loadingBudgets &&
                  expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-md-6">
              <label htmlFor="amount" className="form-label">
                Monto Mensual
              </label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-control"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>



            <div className="col-12 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Creando...
                  </>
                ) : (
                  "Crear Presupuesto"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <hr className="my-5" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="h4 mb-3 mb-md-0">Tus Presupuestos</h2>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="date"
            name="p_start_date"
            className="form-control form-control-sm"
            value={dateFilters.p_start_date}
            onChange={handleFilterChange}
          />
          <span className="text-muted">a</span>
          <input
            type="date"
            name="p_end_date"
            className="form-control form-control-sm"
            value={dateFilters.p_end_date}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="row">
        {loadingBudgets ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando presupuestos...</span>
            </div>
          </div>
        ) : budgets.length > 0 ? (
          budgets.map((budget) => {
            const percentage = (budget.spent / budget.total_budget) * 100;
            const isOverBudget = budget.remaining < 0;
            const absRemaining = Math.abs(budget.remaining || 0);

            const variant =
              percentage > 100
                ? "dark"
                : percentage > 80
                  ? "secondary"
                  : "info";

            return (
              <div key={budget.category_id} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title h6 text-uppercase text-muted mb-0">
                        {budget.category_name}
                      </h5>
                      <button
                        className="btn btn-sm btn-outline-secondary py-1 px-2 border-0"
                        onClick={() =>
                          setEditingBudget({
                            category_id: budget.category_id,
                            category_name: budget.category_name,
                            current_amount: budget.total_budget,
                            new_amount: budget.total_budget,
                          })
                        }
                        title="Editar presupuesto"
                      >
                        <i className="bi bi-pencil me-1"></i> Editar
                      </button>
                    </div>
                    <div className="d-flex justify-content-between align-items-end mb-2">
                      <span className="h4 mb-0">
                        {formatCurrency(budget.spent)}
                      </span>
                      <span className="text-muted small">
                        de {formatCurrency(budget.total_budget)}
                      </span>
                    </div>

                    <div className="progress mb-3" style={{ height: "8px" }}>
                      <div
                        className={`progress-bar bg-${variant}`}
                        role="progressbar"
                        style={{ width: `${Math.min(percentage || 0, 100)}%` }}
                        aria-valuenow={percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-muted">
                        {isOverBudget ? "Sobrepasado por:" : "Disponible:"}
                      </span>
                      <span
                        className={`small fw-bold ${
                          isOverBudget ? "text-dark" : "text-info"
                        }`}
                      >
                        {formatCurrency(absRemaining)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12 text-center py-5">
            <p className="text-muted italic">
              No hay presupuestos configurados para este periodo.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Edición de Presupuesto */}
      {editingBudget && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Editar Presupuesto</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingBudget(null)}
                  disabled={loadingEdit}
                ></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  {editError && (
                    <div className="alert alert-danger py-2 text-sm mb-3">
                      {editError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label text-muted small text-uppercase">
                      Categoría
                    </label>
                    <input
                      type="text"
                      className="form-control fw-medium bg-light"
                      value={editingBudget.category_name}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit_amount" className="form-label">
                      Nuevo Monto Mensual
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        id="edit_amount"
                        className="form-control"
                        step="0.01"
                        min="0"
                        value={editingBudget.new_amount}
                        onChange={(e) =>
                          setEditingBudget({
                            ...editingBudget,
                            new_amount: e.target.value,
                          })
                        }
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setEditingBudget(null)}
                    disabled={loadingEdit}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loadingEdit}
                  >
                    {loadingEdit ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
