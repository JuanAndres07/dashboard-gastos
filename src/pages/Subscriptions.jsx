import { useSubscriptions } from "../hooks/useSubscriptions";
import { IconDotsVertical } from "@tabler/icons-react";
import { formatCurrency } from "../utilities/formatters";

export default function Subscriptions({ user }) {
  // Estilo para permitir que los dropdowns salgan de la tabla responsiva
  const tableResponsiveStyle = {
    overflow: "visible",
  };

  const {
    subscriptions,
    expenseCategories,
    loading,
    loadingSubscriptions,
    loadingCategories,
    name, setName,
    categoryId, setCategoryId,
    amount, setAmount,
    frequency, setFrequency,
    nextPaymentDate, setNextPaymentDate,
    editingId, setEditingId,
    editValues, setEditValues,
    handleSubmit,
    handleDelete,
    startEdit,
    handleUpdate,
    getFrequencyLabel,
    frequencies,
    today
  } = useSubscriptions(user);

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-transparent">
              <h3 className="card-title mb-0">Nueva Suscripción</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Nombre de la Suscripción
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Ej. Netflix, Spotify, Internet..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">
                    Categoría
                  </label>
                  <select
                    id="category"
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    disabled={loadingCategories}
                  >
                    <option value="">Selecciona una categoría</option>
                    {expenseCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">
                    Monto
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="amount"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="frequency" className="form-label">
                    Frecuencia
                  </label>
                  <select
                    id="frequency"
                    className="form-select"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    required
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="next_payment_date" className="form-label">
                    Próximo Pago
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="next_payment_date"
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    min={today}
                    required
                  />
                </div>

                <div className="d-grid mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading || loadingCategories}
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
                      "Crear Suscripción"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row justify-content-center mt-5">
        <div className="col-md-10">
          <div className="card shadow-sm">
            <div className="card-header bg-transparent">
              <h3 className="card-title mb-0">Mis Suscripciones</h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={tableResponsiveStyle}>
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Monto</th>
                      <th>Frecuencia</th>
                      <th>Último Pago</th>
                      <th>Próximo Pago</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingSubscriptions ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div
                            className="spinner-border spinner-border-sm text-primary me-2"
                            role="status"
                          ></div>
                          Cargando suscripciones...
                        </td>
                      </tr>
                    ) : subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No tienes suscripciones registradas.
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((sub) => (
                        <tr key={sub.id}>
                          {editingId === sub.id ? (
                            <>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={editValues.name}
                                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                />
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={editValues.category_id}
                                  onChange={(e) => setEditValues({ ...editValues, category_id: e.target.value })}
                                >
                                  {expenseCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control form-control-sm"
                                  value={editValues.amount}
                                  onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                                />
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={editValues.frequency}
                                  onChange={(e) => setEditValues({ ...editValues, frequency: e.target.value })}
                                >
                                  {frequencies.map((freq) => (
                                    <option key={freq.value} value={freq.value}>
                                      {freq.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>-</td>
                              <td>
                                <input
                                  type="date"
                                  className="form-control form-control-sm"
                                  value={editValues.next_payment_date}
                                  onChange={(e) => setEditValues({ ...editValues, next_payment_date: e.target.value })}
                                  min={today}
                                />
                              </td>
                              <td className="text-end">
                                <div className="btn-group btn-group-sm">
                                  <button className="btn btn-success" onClick={() => handleUpdate(sub)}>
                                    Guardar
                                  </button>
                                  <button className="btn btn-secondary" onClick={() => setEditingId(null)}>
                                    Cancelar
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="fw-medium">{sub.name}</td>
                              <td>{sub.Category?.name || "Sin categoría"}</td>
                              <td className="fw-bold">{formatCurrency(sub.amount)}</td>
                              <td>
                                {getFrequencyLabel(sub.frequency)}
                              </td>
                              <td>
                                {sub.last_payment_date
                                  ? new Date(
                                      sub.last_payment_date,
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td>
                                {new Date(
                                  sub.next_payment_date,
                                ).toLocaleDateString()}
                              </td>
                              <td className="text-end">
                                <div className="dropdown" key={`dropdown-container-${sub.id}`}>
                                  <button
                                    className="btn btn-link text-secondary p-0"
                                    type="button"
                                    id={`dropdownMenuButton-${sub.id}`}
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    key={`dropdown-btn-${sub.id}`}
                                  >
                                    <IconDotsVertical size={20} />
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`dropdownMenuButton-${sub.id}`}>
                                    <li>
                                      <button 
                                        className="dropdown-item" 
                                        type="button"
                                        onClick={() => startEdit(sub)}
                                      >
                                        Editar
                                      </button>
                                    </li>
                                    <li>
                                      <button 
                                        className="dropdown-item text-danger" 
                                        type="button"
                                        onClick={() => handleDelete(sub.id)}
                                      >
                                        Eliminar
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
