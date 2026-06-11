import { useState } from "react";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { IconPlus, IconCreditCardOff, IconPencil, IconTrash, IconCheck, IconX, IconCreditCard } from "@tabler/icons-react";
import { formatCurrency } from "../utilities/formatters";
import Modal from "../components/Modal";
import { Pagination } from "../components/Pagination";
import { iconDictionary } from "../utilities/iconDictionary";

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
              <IconCreditCardOff size={32} stroke={1.5} className="text-(--text-color)/50" />
            </div>
            <h3 className="text-base font-semibold text-(--headings-color) mb-1">
              Sin suscripciones
            </h3>
            <p className="text-sm text-(--text-color)/70 max-w-xs">
              No tienes suscripciones activas registradas actualmente.
            </p>
          </div>
        ) : (
          <>
            {/* Vista Móvil / Tablet (Tarjetas para pantallas menores a lg) */}
            <div className="block lg:hidden space-y-4">
            {paginatedSubscriptions.map((sub) => {
              const CategoryIcon = iconDictionary[sub.Category?.icon] || IconCreditCard;
              const isEditing = editingId === sub.id;
              
              if (isEditing) {
                return (
                  <div 
                    key={sub.id} 
                    className="p-4 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-2xl space-y-4"
                    style={{ border: "var(--card-border)" }}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-(--sidebar-border)/40">
                      <h4 className="font-bold text-(--headings-color) text-xs uppercase tracking-wider">
                        Editar Suscripción
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {/* Nombre */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-(--text-color) uppercase tracking-wide">Nombre</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-xs font-semibold text-(--headings-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* Categoría */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-(--text-color) uppercase tracking-wide">Categoría</label>
                        <select
                          className="w-full px-3 py-2 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-xs font-semibold text-(--text-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
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
                      </div>

                      {/* Monto */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-(--text-color) uppercase tracking-wide">Monto</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-(--text-color)/70">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full pl-6 pr-3 py-2 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-xs font-semibold text-(--headings-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
                            value={editValues.amount}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                amount: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Frecuencia */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-(--text-color) uppercase tracking-wide">Frecuencia</label>
                        <select
                          className="w-full px-3 py-2 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-xs font-semibold text-(--text-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
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
                      </div>

                      {/* Próximo Pago */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-(--text-color) uppercase tracking-wide">Próximo Pago</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-xs font-semibold text-(--text-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
                          value={editValues.next_payment_date}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              next_payment_date: e.target.value,
                            })
                          }
                          min={today}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleUpdate(sub)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-(--success-color) hover:opacity-90 active:scale-[0.98] rounded-xl transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                      >
                        <IconCheck size={16} />
                        <span>Guardar</span>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-(--text-color) bg-(--bg-light) border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) hover:text-(--headings-color) active:scale-[0.98] rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        <IconX size={16} />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={sub.id} 
                  className="flex items-center justify-between p-4 bg-(--settings-card-bg) rounded-2xl border border-(--sidebar-border) transition-all duration-300 gap-3"
                  style={{ border: "var(--card-border)" }}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="p-3 rounded-xl shrink-0 bg-(--sidebar-link-hover-bg) text-(--primary-color) flex items-center justify-center w-11 h-11">
                      <CategoryIcon size={22} />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-(--headings-color) text-sm truncate leading-snug">
                        {sub.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-(--text-color) bg-(--bg-light) dark:bg-(--bg-light)/20 px-2 py-0.5 rounded-md">
                          {sub.Category?.name || "Sin categoría"}
                        </span>
                        <span className="text-[10px] font-semibold text-(--primary-color) bg-(--sidebar-link-hover-bg) px-2 py-0.5 rounded-md">
                          {getFrequencyLabel(sub.frequency)}
                        </span>
                        <span className="text-[10px] font-medium text-(--text-color)/80">
                          Próximo: {new Date(sub.next_payment_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-sm text-(--danger-color) whitespace-nowrap mr-1">
                      -{formatCurrency(sub.amount)}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(sub)}
                        className="p-1.5 rounded-lg text-(--text-color)/50 hover:text-(--primary-color) hover:bg-(--primary-color)/10 transition-all duration-200 cursor-pointer"
                        title="Editar suscripción"
                      >
                        <IconPencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 rounded-lg text-(--text-color)/50 hover:text-(--danger-color) hover:bg-(--danger-color)/10 transition-all duration-200 cursor-pointer"
                        title="Eliminar suscripción"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vista Escritorio (Tabla para pantallas >= lg) */}
          <div 
            className="hidden lg:block overflow-x-auto rounded-2xl border border-(--sidebar-border)" 
            style={{ border: "var(--card-border)" }}
          >
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-(--bg-light) border-b border-(--sidebar-border)">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-(--headings-color) uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-xs font-bold text-(--headings-color) uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-xs font-bold text-(--headings-color) uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-4 text-xs font-bold text-(--headings-color) uppercase tracking-wider">Frecuencia</th>
                  <th className="px-6 py-4 text-xs font-bold text-(--headings-color) uppercase tracking-wider">Último Pago</th>
                  <th className="px-6 py-4 text-xs font-bold text-(--headings-color) uppercase tracking-wider">Próximo Pago</th>
                  <th className="px-6 py-4 text-xs font-bold text-(--headings-color) uppercase tracking-wider text-center w-28">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--sidebar-border)/40 bg-(--settings-card-bg)">
                {paginatedSubscriptions.map((sub) => {
                  const CategoryIcon = iconDictionary[sub.Category?.icon] || IconCreditCard;
                  const isEditing = editingId === sub.id;
                  return (
                    <tr 
                      key={sub.id}
                      className="hover:bg-(--sidebar-link-hover-bg)/30 transition-all duration-200 ease-in-out"
                    >
                      {isEditing ? (
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
                          <td className="px-6 py-3 text-xs text-(--text-color)/50 font-medium">-</td>
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
                          <td className="px-6 py-3 text-center">
                            <div className="flex items-center gap-1.5 justify-center">
                              <button
                                className="p-1.5 rounded-lg text-white bg-(--success-color) hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer inline-flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                                onClick={() => handleUpdate(sub)}
                                title="Guardar cambios"
                              >
                                <IconCheck size={16} />
                              </button>
                              <button
                                className="p-1.5 rounded-lg text-(--text-color) bg-(--bg-light) border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) hover:text-(--headings-color) active:scale-[0.98] transition-all duration-200 cursor-pointer inline-flex items-center justify-center"
                                onClick={() => setEditingId(null)}
                                title="Cancelar edición"
                              >
                                <IconX size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-semibold text-(--headings-color) whitespace-nowrap text-sm">
                            {sub.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-(--sidebar-link-hover-bg) text-(--primary-color) border border-(--sidebar-border)/50">
                              <CategoryIcon size={14} className="shrink-0" />
                              {sub.Category?.name || "Sin categoría"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-(--danger-color) whitespace-nowrap text-sm">
                            -{formatCurrency(sub.amount)}
                          </td>
                          <td className="px-6 py-4 text-(--text-color) whitespace-nowrap text-xs font-semibold">
                            <span className="px-2 py-0.5 rounded bg-(--sidebar-link-hover-bg) text-(--primary-color)">
                              {getFrequencyLabel(sub.frequency)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-(--text-color) whitespace-nowrap text-xs font-medium">
                            {sub.last_payment_date
                              ? new Date(sub.last_payment_date).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "-"}
                          </td>
                          <td className="px-6 py-4 font-semibold text-(--headings-color) whitespace-nowrap text-xs">
                            {new Date(sub.next_payment_date).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center gap-1.5 justify-center">
                              <button
                                onClick={() => startEdit(sub)}
                                className="p-1.5 rounded-lg text-(--text-color)/50 hover:text-(--primary-color) hover:bg-(--primary-color)/10 transition-all duration-200 cursor-pointer inline-flex items-center justify-center"
                                title="Editar"
                              >
                                <IconPencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="p-1.5 rounded-lg text-(--text-color)/50 hover:text-(--danger-color) hover:bg-(--danger-color)/10 transition-all duration-200 cursor-pointer inline-flex items-center justify-center"
                                title="Eliminar"
                              >
                                <IconTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
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
