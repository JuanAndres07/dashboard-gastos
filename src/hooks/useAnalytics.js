import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { formatLocalDate } from "../utilities/formatters";

export function useAnalytics(user) {
  const [sixMonthsData, setSixMonthsData] = useState([]);
  const [isFetchingSixMonths, setIsFetchingSixMonths] = useState(true);
  const [errorSixMonths, setErrorSixMonths] = useState(null);
  const lastSuccessfullyFetchedSixMonthsRef = useRef(null);
  const loadingSixMonths = isFetchingSixMonths && lastSuccessfullyFetchedSixMonthsRef.current === null;

  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [isFetchingExpenses, setIsFetchingExpenses] = useState(true);
  const [errorExpenses, setErrorExpenses] = useState(null);

  const [budgets, setBudgets] = useState([]);
  const [isFetchingBudgets, setIsFetchingBudgets] = useState(true);
  const [errorBudgets, setErrorBudgets] = useState(null);

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

  const lastSuccessfullyFetchedExpensesRef = useRef(null);
  const currentExpenseFilterKey = JSON.stringify({ p_start_date: dateFilters.p_start_date, p_end_date: dateFilters.p_end_date });
  const loadingExpenses = isFetchingExpenses && lastSuccessfullyFetchedExpensesRef.current !== currentExpenseFilterKey;

  // 1. Obtener la evolución mensual de los últimos 6 meses (ingresos vs gastos)
  const fetchSixMonthsEvolution = useCallback(
    async (signal) => {
      if (!user?.id) return;
      setIsFetchingSixMonths(true);
      setErrorSixMonths(null);

      try {
        const { data, error } = await supabase
          .rpc("get_six_months_evolution")
          .abortSignal(signal);

        if (error) {
          throw error;
        }
        setSixMonthsData(data || []);
        lastSuccessfullyFetchedSixMonthsRef.current = true;
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
        if (!signal.aborted) {
          setIsFetchingSixMonths(false);
        }
      }
    },
    [user?.id],
  );

  // 2. Obtener gastos agrupados por categoría en un rango de fechas
  const fetchExpensesByCategory = useCallback(
    async (signal) => {
      if (!user?.id) return;
      setIsFetchingExpenses(true);
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
        lastSuccessfullyFetchedExpensesRef.current = currentExpenseFilterKey;
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
        if (!signal.aborted) {
          setIsFetchingExpenses(false);
        }
      }
    },
    [user?.id, dateFilters.p_start_date, dateFilters.p_end_date, currentExpenseFilterKey],
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

  // 3. Obtener presupuestos de usuario en un rango de fechas
  const fetchBudgets = useCallback(
    async (signal) => {
      if (!user?.id) return;
      setIsFetchingBudgets(true);
      setErrorBudgets(null);

      try {
        const { data, error } = await supabase
          .rpc("get_user_budgets", {
            p_start_date: dateFilters.p_start_date,
            p_end_date: dateFilters.p_end_date,
          })
          .abortSignal(signal);

        if (error) {
          throw error;
        }
        setBudgets(data || []);
      } catch (err) {
        const isAbortError =
          err.name === "AbortError" || err.message?.includes("AbortError");
        if (!isAbortError) {
          setErrorBudgets(
            err.message || "Error al cargar los presupuestos",
          );
          console.error("Error fetching budgets:", err);
        }
      } finally {
        if (!signal.aborted) {
          setIsFetchingBudgets(false);
        }
      }
    },
    [user?.id, dateFilters.p_start_date, dateFilters.p_end_date],
  );

  // Efecto para los presupuestos del periodo
  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();
    fetchBudgets(controller.signal);

    return () => {
      controller.abort();
    };
  }, [user?.id, fetchBudgets, refreshTrigger]);

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
    budgets,
    loadingBudgets: isFetchingBudgets,
    errorBudgets,
    dateFilters,
    setDateFilters,
    handleFilterChange,
    setManualFilters,
    refetchAll,
  };
}
