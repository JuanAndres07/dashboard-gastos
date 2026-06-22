import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useTransactions({ user, limit, initialViewMode = "expense", trigger, categoryId, page = 1, pageSize = 20, startDate, endDate, search }) {
  const [transactions, setTransactions] = useState([]);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const lastSuccessfullyFetchedFiltersRef = useRef(null);
  const currentFilterKey = JSON.stringify({ viewMode, categoryId, page, startDate, endDate, search });
  const loading = isFetching && lastSuccessfullyFetchedFiltersRef.current !== currentFilterKey;

  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();
    
    async function fetchTransactions(signal) {
      setIsFetching(true);
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
            transaction_date,
            created_at,
            category_id,
            Category (name, icon)
            `,
            { count: "exact" }
          )
          .eq("user_id", user.id)
          .eq("type", viewMode)
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false })
          .abortSignal(signal);

        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        if (startDate) {
          query = query.gte("transaction_date", startDate);
        }

        if (endDate) {
          query = query.lte("transaction_date", `${endDate}T23:59:59.999Z`);
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
        lastSuccessfullyFetchedFiltersRef.current = currentFilterKey;
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
          console.error("Error inesperado:", err);
        }
      } finally {
        if (!signal.aborted) {
          setIsFetching(false);
        }
      }
    }

    fetchTransactions(controller.signal);

    return () => {
      controller.abort();
    };
  }, [user?.id, limit, viewMode, trigger, categoryId, page, pageSize, startDate, endDate, search, currentFilterKey]);

  const updateTransaction = async (id, updatedFields) => {
    try {
      const { data, error: updateError } = await supabase
        .from("Transaction")
        .update(updatedFields)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select();

      if (updateError) {
        return { success: false, error: updateError };
      }
      return { success: true, data };
    } catch (err) {
      console.error("Error inesperado en updateTransaction:", err);
      return { success: false, error: err };
    }
  };

  return {
    transactions,
    loading,
    error,
    viewMode,
    setViewMode,
    totalCount,
    updateTransaction,
  };
}
