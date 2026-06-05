import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useTransactions({ user, limit, initialViewMode = "expense", trigger, categoryId, page = 1, pageSize = 20, startDate, endDate, search }) {
  const [transactions, setTransactions] = useState([]);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();
    
    async function fetchTransactions(signal) {
      setLoading(true);
      setError(null);

      try {
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
            { count: "exact" }
          )
          .eq("user_id", user.id)
          .eq("type", viewMode)
          .order("created_at", { ascending: false })
          .abortSignal(signal);

        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        if (startDate) {
          query = query.gte("created_at", startDate);
        }

        if (endDate) {
          query = query.lte("created_at", `${endDate}T23:59:59.999Z`);
        }

        if (search) {
          query = query.ilike("note", `%${search}%`);
        }

        if (limit) {
          query = query.limit(limit);
        } else {
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;
          query = query.range(from, to);
        }

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          const isAbortError = fetchError.message?.includes('AbortError') || fetchError.name === 'AbortError';
          if (!isAbortError) {
            setError(fetchError);
            console.error("Error al obtener transacciones:", fetchError.message);
          }
          return;
        }

        setTransactions(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
          console.error("Error inesperado:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions(controller.signal);

    return () => {
      controller.abort();
    };
  }, [user?.id, limit, viewMode, trigger, categoryId, page, pageSize, startDate, endDate, search]);

  return {
    transactions,
    loading,
    error,
    viewMode,
    setViewMode,
    totalCount,
  };
}
