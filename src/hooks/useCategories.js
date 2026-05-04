import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useCategories(user) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Ejecutar ambas consultas en paralelo
      const [allResponse, hiddenResponse] = await Promise.all([
        supabase
          .from("Category")
          .select("*")
          .order("name", { ascending: true }),
        supabase
          .from("HiddenCategory")
          .select("category_id")
          .eq("user_id", user.id)
      ]);

      const { data: allCategories, error: errCat } = allResponse;
      const { data: hiddenCategories, error: errHidden } = hiddenResponse;

      if (errCat) throw errCat;
      if (errHidden) throw errHidden;

      const hiddenIds = hiddenCategories?.map((h) => h.category_id) || [];
      
      // Filtrar las visibles
      const visibleCategories = allCategories?.filter((cat) => !hiddenIds.includes(cat.id)) || [];

      setCategories(visibleCategories);
    } catch (err) {
      setError(err);
      console.error("Error al cargar categorías:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  return {
    categories,
    loading,
    error,
    refreshCategories: loadCategories,
  };
}
