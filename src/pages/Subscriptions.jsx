import { useState } from "react";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { IconPlus } from "@tabler/icons-react";
import { formatCurrency } from "../utilities/formatters";
import Modal from "../components/Modal";
import { Pagination } from "../components/Pagination";

export default function Subscriptions({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    subscriptions,
    expenseCategories,
    loading,
    loadingSubscriptions,
    loadingCategories,
    name,
    setName,
    categoryId,
    setCategoryId,
    amount,
    setAmount,
    frequency,
    setFrequency,
    nextPaymentDate,
    setNextPaymentDate,
    editingId,
    setEditingId,
    editValues,
    setEditValues,
    handleSubmit,
    handleDelete,
    startEdit,
    handleUpdate,
    getFrequencyLabel,
    frequencies,
    today,
  } = useSubscriptions(user);

  // Sliced subscriptions for pagination
  const paginatedSubscriptions = subscriptions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !categoryId || !amount || !frequency || !nextPaymentDate) {
      alert("Por favor completa todos los campos");
      return;
    }
    if (nextPaymentDate < today) {
      alert("La fecha del próximo pago no puede ser anterior a hoy");
      return;
    }
    await handleSubmit(e);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full space-y-6 text-left">
      {/* Cabecera */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">
            Mis Suscripciones
          </h1>
          <p className="text-sm text-(--text-color)/85 mt-1">
            Administra tus servicios recurrentes y pagos programados de forma
            sencilla.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-(--primary-color) text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] cursor-pointer text-sm shrink-0"
        >
          <IconPlus size={18} className="shrink-0" />
          <span>Nueva Suscripción</span>
        </button>
      </header>

      {/* Tarjeta con el Listado */}
      <div
        className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
        style={{ border: "var(--card-border)" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-(--headings-color)">
            Suscripciones Activas
          </h2>
        </div>

        {loadingSubscriptions ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
            <span className="text-sm font-medium text-(--text-color)">
              Cargando suscripciones...
            </span>
          </div>
        ) : subscriptions.length === 0 ? (
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
                  d="M20 12H4M20 12a8 8 0 11-16 0 8 8 0 0116 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-(--headings-color) mb-1">
              Sin suscripciones
            </h3>
            <p className="text-sm text-(--text-color)/70 max-w-xs">
              No tienes suscripciones activas registradas actualmente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full -mx-6 sm:mx-0">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-(--bg-light)/50">
                <tr className="border-b border-(--sidebar-border)">
                  <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider">
                    Frecuencia
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider">
                    Último Pago
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider">
                    Próximo Pago
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-(--text-color)/70 uppercase tracking-wider text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--sidebar-border)/40">
                {paginatedSubscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-(--sidebar-link-hover-bg)/30 transition-all duration-200 ease-in-out"
                  >
                    {editingId === sub.id ? (
                      <>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            className="w-full px-2.5 py-1.5 bg-(--bg-light) border border-(--sidebar-border) rounded-lg text-xs font-semibold text-(--headings-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
                            value={editValues.name}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                name: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="px-6 py-3">
                          <select
                            className="w-full px-2.5 py-1.5 bg-(--bg-light) border border-(--sidebar-border) rounded-lg text-xs font-semibold text-(--text-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
                            value={editValues.category_id}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                category_id: e.target.value,
                              })
                            }
                          >
                            {expenseCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs font-semibold text-(--text-color)/70">
                              $
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              className="w-full pl-5 pr-2 py-1.5 bg-(--bg-light) border border-(--sidebar-border) rounded-lg text-xs font-semibold text-(--headings-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
                              value={editValues.amount}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  amount: e.target.value,
                                })
                              }
                            />
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <select
                            className="w-full px-2.5 py-1.5 bg-(--bg-light) border border-(--sidebar-border) rounded-lg text-xs font-semibold text-(--text-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
                            value={editValues.frequency}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                frequency: e.target.value,
                              })
                            }
                          >
                            {frequencies.map((freq) => (
                              <option key={freq.value} value={freq.value}>
                                {freq.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-3 text-xs text-(--text-color)/50 font-medium">
                          -
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="date"
                            className="w-full px-2.5 py-1.5 bg-(--bg-light) border border-(--sidebar-border) rounded-lg text-xs font-semibold text-(--text-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
                            value={editValues.next_payment_date}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                next_payment_date: e.target.value,
                              })
                            }
                            min={today}
                          />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              className="px-2.5 py-1.5 text-[11px] font-semibold text-white bg-(--success-color) hover:opacity-90 active:scale-[0.98] rounded-lg transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                              onClick={() => handleUpdate(sub)}
                            >
                              Guardar
                            </button>
                            <button
                              className="px-2.5 py-1.5 text-[11px] font-semibold text-(--text-color) bg-(--bg-light) border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) hover:text-(--headings-color) active:scale-[0.98] rounded-lg transition-all duration-200 cursor-pointer"
                              onClick={() => setEditingId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-semibold text-(--headings-color) whitespace-nowrap">
                          {sub.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-(--sidebar-link-hover-bg) text-(--primary-color)">
                            {sub.Category?.name || "Sin categoría"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-(--danger-color) whitespace-nowrap">
                          -{formatCurrency(sub.amount)}
                        </td>
                        <td className="px-6 py-4 text-(--text-color) whitespace-nowrap">
                          {getFrequencyLabel(sub.frequency)}
                        </td>
                        <td className="px-6 py-4 text-(--text-color) whitespace-nowrap">
                          {sub.last_payment_date
                            ? new Date(
                                sub.last_payment_date,
                              ).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="px-6 py-4 font-medium text-(--headings-color) whitespace-nowrap">
                          {new Date(sub.next_payment_date).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => startEdit(sub)}
                              className="px-3 py-1.5 text-xs font-semibold text-(--primary-color) bg-(--sidebar-link-hover-bg) border border-(--sidebar-border) hover:bg-(--primary-color) hover:text-white rounded-lg transition-all duration-200 cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-(--danger-color) bg-(--danger-color)/10 border border-(--danger-color)/20 hover:bg-(--danger-color) hover:text-white rounded-lg transition-all duration-200 cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalCount={subscriptions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          showingCount={paginatedSubscriptions.length}
          loading={loadingSubscriptions}
        />
      </div>

      {/* Modal para Agregar Suscripción */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Suscripción"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Nombre de la Suscripción */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-xs font-semibold text-(--text-color) tracking-wide"
            >
              Nombre de la Suscripción
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ej. Netflix, Spotify, Internet..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="category"
              className="text-xs font-semibold text-(--text-color) tracking-wide"
            >
              Categoría
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={loadingCategories}
              className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--text-color) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Monto */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="amount"
              className="text-xs font-semibold text-(--text-color) tracking-wide"
            >
              Monto
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold text-(--text-color)/70">
                $
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Frecuencia */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="frequency"
              className="text-xs font-semibold text-(--text-color) tracking-wide"
            >
              Frecuencia
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              required
              className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--text-color) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          {/* Próximo Pago */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="next_payment_date"
              className="text-xs font-semibold text-(--text-color) tracking-wide"
            >
              Próximo Pago
            </label>
            <input
              id="next_payment_date"
              type="date"
              value={nextPaymentDate}
              onChange={(e) => setNextPaymentDate(e.target.value)}
              min={today}
              required
              className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--text-color) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300 cursor-pointer"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-sm transition-all duration-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingCategories}
              className="flex-1 py-2.5 bg-(--primary-color) text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)]"
            >
              {loading ? "Creando..." : "Crear Suscripción"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
