import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useCategories(user) {
  const [categories, setCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const lastSuccessfullyFetchedRef = useRef(null);
  const loading = isFetching && lastSuccessfullyFetchedRef.current === null;

  const loadCategories = useCallback(async (signal) => {
    if (!user?.id) return;

    setIsFetching(true);
    setError(null);

    try {
      let queryAll = supabase
        .from("Category")
        .select("*")
        .order("name", { ascending: true });

      let queryHidden = supabase
        .from("HiddenCategory")
        .select("category_id")
        .eq("user_id", user.id);

      if (signal) {
        queryAll = queryAll.abortSignal(signal);
        queryHidden = queryHidden.abortSignal(signal);
      }

      // Ejecutar ambas consultas en paralelo
      const [allResponse, hiddenResponse] = await Promise.all([
        queryAll,
        queryHidden
      ]);

      const { data: allCategories, error: errCat } = allResponse;
      const { data: hiddenCategories, error: errHidden } = hiddenResponse;

      if (errCat) throw errCat;
      if (errHidden) throw errHidden;

      const hiddenIds = hiddenCategories?.map((h) => h.category_id) || [];
      
      // Filtrar las visibles
      const visibleCategories = allCategories?.filter((cat) => !hiddenIds.includes(cat.id)) || [];

      setCategories(visibleCategories);
      lastSuccessfullyFetchedRef.current = true;
    } catch (err) {
      const isAbortError = err.name === "AbortError" || err.message?.includes("AbortError");
      if (!isAbortError) {
        setError(err);
        console.error("Error al cargar categorías:", err.message);
      }
    } finally {
      if (!signal || !signal.aborted) {
        setIsFetching(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    const controller = new AbortController();
    loadCategories(controller.signal);
    return () => controller.abort();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refreshCategories: loadCategories,
  };
}
