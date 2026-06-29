import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useCategories } from "./useCategories";
import { formatLocalDate } from "../utilities/formatters";
import { toast } from "sonner";
import { translateSupabaseError } from "../utilities/supabaseErrors";

export function useBudgets(user) {
  const { categories, loading: loadingCategories } = useCategories(user);

  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);

  // Estados para la edición de presupuesto
  const [editingBudget, setEditingBudget] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

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

  // Estados para presupuestos consumidos desde la RPC
  const [budgets, setBudgets] = useState([]);
  const [isFetchingBudgets, setIsFetchingBudgets] = useState(true);
  const lastSuccessfullyFetchedBudgetsRef = useRef(null);
  const currentBudgetsFilterKey = JSON.stringify(dateFilters);
  const loadingBudgets = isFetchingBudgets && lastSuccessfullyFetchedBudgetsRef.current !== currentBudgetsFilterKey;

  const expenseCategories = useMemo(() => {
    const activeBudgetCategoryIds = new Set(budgets.map((b) => b.category_id));
    return categories.filter(
      (cat) => cat.type === "expense" && !activeBudgetCategoryIds.has(cat.id),
    );
  }, [budgets, categories]);


  const fetchBudgets = useCallback(async (signal) => {
    if (!user?.id) return;
    setIsFetchingBudgets(true);
    
    try {
      let query = supabase.rpc("get_user_budgets", {
        p_start_date: dateFilters.p_start_date,
        p_end_date: dateFilters.p_end_date,
      });

      if (signal) {
        query = query.abortSignal(signal);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setBudgets(data || []);
      lastSuccessfullyFetchedBudgetsRef.current = currentBudgetsFilterKey;
    } catch (error) {
      const isAbortError = error.name === "AbortError" || error.message?.includes("AbortError");
      if (!isAbortError) {
        console.error("Error fetching budgets:", error.message);
      }
    } finally {
      if (!signal || !signal.aborted) {
        setIsFetchingBudgets(false);
      }
    }
  }, [user?.id, dateFilters.p_start_date, dateFilters.p_end_date, currentBudgetsFilterKey]);

  useEffect(() => {
    const controller = new AbortController();
    fetchBudgets(controller.signal);
    return () => controller.abort();
  }, [fetchBudgets]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { category_id, amount } = formData;

    const { error } = await supabase.from("Budget").insert([
      {
        user_id: user.id,
        category_id: category_id,
        amount: amount,
        valid_from: formatLocalDate(new Date()),
        valid_to: null,
      },
    ]);

    if (error) {
      toast.error("Error al crear presupuesto: " + translateSupabaseError(error));
    } else {
      toast.success("Presupuesto creado con éxito");
      setFormData({
        category_id: "",
        amount: "",
      });
      fetchBudgets();
    }
    setLoading(false);
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setLoadingEdit(true);

    const { error } = await supabase.rpc("update_budget_amount", {
      p_category_id: editingBudget.category_id,
      p_new_amount: editingBudget.new_amount,
    });

    if (error) {
      toast.error("Error al actualizar presupuesto: " + translateSupabaseError(error));
    } else {
      toast.success(`Presupuesto de ${editingBudget.category_name} actualizado con éxito`);
      setEditingBudget(null);
      fetchBudgets();
    }
    setLoadingEdit(false);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilters((prev) => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    loading,
    budgets,
    loadingBudgets,
    editingBudget,
    setEditingBudget,
    loadingEdit,
    dateFilters,
    expenseCategories,
    loadingCategories,
    handleSubmit,
    handleEditSubmit,
    handleChange,
    handleFilterChange,
    fetchBudgets,
  };
}
