import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { formatCurrency } from "../utilities/formatters";

export function TransactionTable({ limit, user, trigger }) {
  const [transaction, setTransaction] = useState([]);
  const [viewMode, setViewMode] = useState("expense");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchTransactions(controller.signal);

    return () => {
      controller.abort();
    };
  }, [limit, viewMode, trigger]);

  async function fetchTransactions(signal) {
    setLoading(true);

    let query = supabase
      .from("Transaction")
      .select(
        `
        id,
        amount,
        note,
        type,
        created_at,
        category_id,
        Category (name)
        `,
      )
      .eq("user_id", user.id)
      .eq("type", viewMode)
      .order("created_at", { ascending: false })
      .abortSignal(signal);

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      const isAbortError = error.message?.includes('AbortError') || error.name === 'AbortError';
      if (!isAbortError) {
        alert("Error al obtener transacciones: " + error.message);
      }
      return;
    }

    setTransaction(data);
    setLoading(false);
  }

  return (
    <div>
      <div>
        <button onClick={() => setViewMode("expense")}>Gastos</button>
        <button onClick={() => setViewMode("income")}>Ingresos</button>
      </div>

      {loading ? (
        <p>Cargando movimientos...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {transaction.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td>{t.note || "Sin descripción"}</td>
                <td>{t.Category?.name}</td>
                <td>
                  {t.type === "expense" ? "-" : "+"}
                  {formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {transaction.length === 0 && !loading && (
        <p>No hay movimientos para mostrar</p>
      )}
    </div>
  );
}
