import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function TransactionTable({ limit, user }) {
  const [transaction, setTransaction] = useState([]);
  const [viewMode, setViewMode] = useState("expense");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchTransactions();

    return () => {
      controller.abort();
    };
  }, [limit, viewMode]);

  async function fetchTransactions() {
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
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      alert("Error al obtener transacciones", error);
      return;
    }

    setTransaction(data);
    setLoading(false);
  }

  const filteredData = transaction.filter((t) => t.type === viewMode);

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
            {filteredData.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td>{t.note || "Sin descripción"}</td>
                <td>{t.Category.name}</td>
                <td>${t.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {filteredData.length === 0 && !loading && (
        <p>No hay movimientos para mostrar</p>
      )}
    </div>
  );
}
