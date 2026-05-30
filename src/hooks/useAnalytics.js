import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { formatLocalDate } from "../utilities/formatters";

export function useAnalytics(user) {
  const [sixMonthsData, setSixMonthsData] = useState([]);
  const [loadingSixMonths, setLoadingSixMonths] = useState(true);
  const [errorSixMonths, setErrorSixMonths] = useState(null);

  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [errorExpenses, setErrorExpenses] = useState(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filtros de fecha (mes actual por defecto)
  const now = new Date();
  const firstDay = formatLocalDate(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const lastDay = formatLocalDate(
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
  );

  const [dateFilters, setDateFilters] = useState({
    p_start_date: firstDay,
    p_end_date: lastDay,
  });

  // 1. Obtener la evolución mensual de los últimos 6 meses (ingresos vs gastos)
  const fetchSixMonthsEvolution = useCallback(
    async (signal) => {
      if (!user?.id) return;
      setLoadingSixMonths(true);
      setErrorSixMonths(null);

      try {
        const { data, error } = await supabase
          .rpc("get_six_months_evolution")
          .abortSignal(signal);

        if (error) {
          throw error;
        }
        setSixMonthsData(data || []);
      } catch (err) {
        const isAbortError =
          err.name === "AbortError" || err.message?.includes("AbortError");
        if (!isAbortError) {
          setErrorSixMonths(
            err.message || "Error al cargar la evolución mensual",
          );
          console.error("Error fetching six months evolution:", err);
        }
      } finally {
        setLoadingSixMonths(false);
      }
    },
    [user?.id],
  );

  // 2. Obtener gastos agrupados por categoría en un rango de fechas
  const fetchExpensesByCategory = useCallback(
    async (signal) => {
      if (!user?.id) return;
      setLoadingExpenses(true);
      setErrorExpenses(null);

      try {
        const { data, error } = await supabase
          .rpc("get_expenses_by_category", {
            p_start_date: dateFilters.p_start_date,
            p_end_date: dateFilters.p_end_date,
          })
          .abortSignal(signal);

        if (error) {
          throw error;
        }
        setExpensesByCategory(data || []);
      } catch (err) {
        const isAbortError =
          err.name === "AbortError" || err.message?.includes("AbortError");
        if (!isAbortError) {
          setErrorExpenses(
            err.message || "Error al cargar los gastos por categoría",
          );
          console.error("Error fetching expenses by category:", err);
        }
      } finally {
        setLoadingExpenses(false);
      }
    },
    [user?.id, dateFilters.p_start_date, dateFilters.p_end_date],
  );

  // Efecto para la evolución mensual
  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();
    fetchSixMonthsEvolution(controller.signal);

    return () => {
      controller.abort();
    };
  }, [user?.id, fetchSixMonthsEvolution, refreshTrigger]);

  // Efecto para el desglose de gastos por categoría
  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();
    fetchExpensesByCategory(controller.signal);

    return () => {
      controller.abort();
    };
  }, [user?.id, fetchExpensesByCategory, refreshTrigger]);

  // Manejador genérico para inputs de tipo fecha
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Función para establecer filtros manualmente (e.g., accesos directos / presets)
  const setManualFilters = (startDate, endDate) => {
    setDateFilters({
      p_start_date: startDate,
      p_end_date: endDate,
    });
  };

  // Forzar recarga de ambos conjuntos de datos
  const refetchAll = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    sixMonthsData,
    loadingSixMonths,
    errorSixMonths,
    expensesByCategory,
    loadingExpenses,
    errorExpenses,
    dateFilters,
    setDateFilters,
    handleFilterChange,
    setManualFilters,
    refetchAll,
  };
}
