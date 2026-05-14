import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCategories } from "../hooks/useCategories";

export default function Budgets({ user }) {
  const { categories, loading: loadingCategories } = useCategories(user);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    valid_from: formatLocalDate(new Date()),
    valid_to: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Estados para presupuestos consumidos desde la RPC
  const [budgets, setBudgets] = useState([]);
  const [loadingBudgets, setLoadingBudgets] = useState(true);

  // Filtros de fecha (mes actual por defecto)
  const now = new Date();
  const firstDay = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const lastDay = formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const [dateFilters, setDateFilters] = useState({
    p_start_date: firstDay,
    p_end_date: lastDay,
  });

  const activeBudgetCategoryIds = new Set(budgets.map((b) => b.category_id));
  const expenseCategories = categories.filter(
    (cat) => cat.type === "expense" && !activeBudgetCategoryIds.has(cat.id),
  );

  async function fetchBudgets() {
    if (!user?.id) return;
    setLoadingBudgets(true);
    const { data, error } = await supabase.rpc("get_user_budgets", {
      p_start_date: dateFilters.p_start_date,
      p_end_date: dateFilters.p_end_date,
    });

    if (error) {
      console.error("Error fetching budgets:", error.message);
    } else {
      setBudgets(data || []);
    }
    setLoadingBudgets(false);
  }

  useEffect(() => {
    fetchBudgets();
  }, [user?.id, dateFilters.p_start_date, dateFilters.p_end_date]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const { category_id, amount, valid_from, valid_to } = formData;

    const { error } = await supabase.from("Budget").insert([
      {
        user_id: user.id,
        category_id: category_id,
        amount: parseFloat(amount),
        valid_from: valid_from,
        valid_to: valid_to || null,
      },
    ]);

    if (error) {
      setMessage({
        type: "danger",
        text: "Error al crear presupuesto: " + error.message,
      });
    } else {
      setMessage({ type: "success", text: "Presupuesto creado con éxito" });
      setFormData({
        category_id: "",
        amount: "",
        valid_from: formatLocalDate(new Date()),
        valid_to: "",
      });
      fetchBudgets();
    }
    setLoading(false);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilters((prev) => ({ ...prev, [name]: value }));
  };

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

            <div className="col-md-6">
              <label htmlFor="valid_from" className="form-label">
                Válido desde
              </label>
              <input
                type="date"
                id="valid_from"
                name="valid_from"
                className="form-control"
                value={formData.valid_from}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="valid_to" className="form-label">
                Válido hasta (Opcional)
              </label>
              <input
                type="date"
                id="valid_to"
                name="valid_to"
                className="form-control"
                value={formData.valid_to}
                onChange={handleChange}
              />
              <div className="form-text">
                Dejar vacío para que el presupuesto sea permanente.
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
            const variant =
              percentage > 100
                ? "danger"
                : percentage > 80
                ? "warning"
                : "success";

            return (
              <div key={budget.category_id} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="card-title h6 text-uppercase text-muted mb-3">
                      {budget.category_name}
                    </h5>
                    <div className="d-flex justify-content-between align-items-end mb-2">
                      <span className="h4 mb-0">
                        ${budget.spent?.toFixed(2) || "0.00"}
                      </span>
                      <span className="text-muted small">
                        de ${budget.total_budget?.toFixed(2) || "0.00"}
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

                    <div className="d-flex justify-content-between">
                      <span className="small text-muted">Restante:</span>
                      <span
                        className={`small fw-bold ${
                          budget.remaining < 0 ? "text-danger" : "text-success"
                        }`}
                      >
                        ${budget.remaining?.toFixed(2) || "0.00"}
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
    </div>
  );
}
