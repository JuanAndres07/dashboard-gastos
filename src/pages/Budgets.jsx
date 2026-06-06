import { useState } from "react";
import { useBudgets } from "../hooks/useBudgets";
import { formatCurrency } from "../utilities/formatters";
import Modal from "../components/Modal";
import { IconPlus, IconPencil, IconX } from "@tabler/icons-react";

export default function Budgets({ user }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="w-full space-y-6 text-left">
      {/* Cabecera */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">
            Presupuestos
          </h1>
          <p className="text-sm text-(--text-color)/85 mt-1">
            Configura tus límites de gastos mensuales por categoría para mantener tus finanzas bajo control.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-(--primary-color) text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] cursor-pointer text-sm shrink-0"
        >
          <IconPlus size={18} className="shrink-0" />
          <span>Nuevo Presupuesto</span>
        </button>
      </header>

      {/* Alerta/Mensaje de éxito o error */}
      {message.text && (
        <div
          className={`p-4 rounded-xl border flex justify-between items-center transition-all duration-300 ${
            message.type === "danger"
              ? "bg-(--danger-color)/10 border-(--danger-color)/20 text-(--danger-color)"
              : "bg-(--success-color)/10 border-(--success-color)/20 text-(--success-color)"
          }`}
        >
          <span className="text-sm font-semibold">{message.text}</span>
          <button
            type="button"
            className="p-1 rounded-lg hover:bg-black/5 text-current transition-all duration-200 cursor-pointer"
            onClick={() => setMessage({ type: "", text: "" })}
            aria-label="Cerrar mensaje"
          >
            <IconX size={16} />
          </button>
        </div>
      )}

      {/* Listado de Presupuestos */}
      <div
        className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
        style={{ border: "var(--card-border)" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-(--headings-color)">
            Tus Presupuestos
          </h2>

          {/* Filtros de Fecha */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-semibold text-(--text-color) whitespace-nowrap uppercase tracking-wider">
              Periodo:
            </label>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <input
                type="date"
                name="p_start_date"
                aria-label="Fecha de inicio"
                className="w-full sm:w-auto px-3 py-2 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-xl text-(--headings-color) text-xs font-medium focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
                value={dateFilters.p_start_date}
                onChange={handleFilterChange}
              />
              <span className="text-xs text-(--text-color)/50 font-medium">a</span>
              <input
                type="date"
                name="p_end_date"
                aria-label="Fecha de fin"
                className="w-full sm:w-auto px-3 py-2 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-xl text-(--headings-color) text-xs font-medium focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
                value={dateFilters.p_end_date}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>

        {loadingBudgets ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
            <span className="text-sm font-medium text-(--text-color)">
              Cargando presupuestos...
            </span>
          </div>
        ) : budgets.length > 0 ? (
          <div className="flex flex-wrap gap-6">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.total_budget) * 100;
              const isOverBudget = budget.remaining < 0;
              const absRemaining = Math.abs(budget.remaining || 0);

              // Determine color de la barra de progreso
              let progressColor = "bg-(--success-color)";
              if (percentage > 100) {
                progressColor = "bg-(--danger-color)";
              } else if (percentage > 80) {
                progressColor = "bg-[#d97706]";
              }

              return (
                <div
                  key={budget.category_id}
                  className="w-full md:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                  style={{ border: "var(--card-border)" }}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-(--text-color)/80 text-ellipsis overflow-hidden whitespace-nowrap" title={budget.category_name}>
                        {budget.category_name}
                      </h3>
                      <button
                        onClick={() =>
                          setEditingBudget({
                            category_id: budget.category_id,
                            category_name: budget.category_name,
                            current_amount: budget.total_budget,
                            new_amount: budget.total_budget,
                          })
                        }
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-(--primary-color) bg-(--sidebar-link-hover-bg) border border-(--sidebar-border) hover:bg-(--primary-color) hover:text-white rounded-lg transition-all duration-200 cursor-pointer"
                        title="Editar presupuesto"
                      >
                        <IconPencil size={14} className="shrink-0" />
                        <span>Editar</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-2xl font-extrabold text-(--headings-color)">
                        {formatCurrency(budget.spent)}
                      </span>
                      <span className="text-xs text-(--text-color)/70 font-medium">
                        de {formatCurrency(budget.total_budget)}
                      </span>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="w-full h-2 bg-(--bg-light) rounded-full overflow-hidden mb-4">
                      <div
                        className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                        style={{ width: `${Math.min(percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-(--sidebar-border)/40 text-xs">
                    <span className="text-(--text-color)/70 font-medium">
                      {isOverBudget ? "Sobrepasado por:" : "Disponible:"}
                    </span>
                    <span
                      className={`font-bold ${
                        isOverBudget ? "text-(--danger-color)" : "text-(--success-color)"
                      }`}
                    >
                      {formatCurrency(absRemaining)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-(--bg-light) flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105">
              <svg
                className="w-8 h-8 text-(--text-color)/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-(--headings-color) mb-1">
              Sin presupuestos
            </h3>
            <p className="text-sm text-(--text-color)/70 max-w-xs">
              No hay presupuestos configurados para este periodo.
            </p>
          </div>
        )}
      </div>

      {/* Modal para Crear Presupuesto */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Presupuesto"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="category_id"
              className="text-xs font-semibold text-(--text-color) tracking-wide"
            >
              Categoría
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              disabled={loadingCategories || loadingBudgets}
              className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              <option value="" disabled>
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

          {/* Monto Mensual */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="amount"
              className="text-xs font-semibold text-(--text-color) tracking-wide"
            >
              Monto Mensual
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold text-(--text-color)/70">
                $
              </span>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
                className="w-full pl-8 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 py-2.5 border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-sm transition-all duration-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-(--primary-color) text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)]"
            >
              {loading ? "Creando..." : "Crear Presupuesto"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edición de Presupuesto */}
      <Modal
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        title="Editar Presupuesto"
      >
        {editingBudget && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <div className="p-3 bg-(--danger-color)/10 border border-(--danger-color)/20 text-(--danger-color) text-xs font-semibold rounded-lg">
                {editError}
              </div>
            )}

            {/* Categoría (Solo lectura) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-(--text-color) tracking-wide">
                Categoría
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-(--bg-light)/60 border border-(--sidebar-border) rounded-xl text-(--headings-color) text-sm font-semibold opacity-70 cursor-not-allowed"
                value={editingBudget.category_name}
                disabled
              />
            </div>

            {/* Nuevo Monto Mensual */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit_amount"
                className="text-xs font-semibold text-(--text-color) tracking-wide"
              >
                Nuevo Monto Mensual
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold text-(--text-color)/70">
                  $
                </span>
                <input
                  id="edit_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editingBudget.new_amount}
                  onChange={(e) =>
                    setEditingBudget({
                      ...editingBudget,
                      new_amount: e.target.value,
                    })
                  }
                  required
                  autoFocus
                  className="w-full pl-8 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingBudget(null)}
                disabled={loadingEdit}
                className="flex-1 py-2.5 border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-sm transition-all duration-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loadingEdit}
                className="flex-1 py-2.5 bg-(--primary-color) text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_12px_rgba(0,82,204,0.15)]"
              >
                {loadingEdit ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
