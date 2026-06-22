import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { translateSupabaseError } from "../utilities/supabaseErrors";

export default function useManageCategories(user) {
  const [categories, setCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const lastSuccessfullyFetchedRef = useRef(null);
  const loading = isFetching && lastSuccessfullyFetchedRef.current === null;

  const fetchCategories = useCallback(async (signal) => {
    if (!user?.id) return;
    
    setIsFetching(true);
    try {
      let queryAll = supabase
        .from("Category")
        .select("*")
        .eq("is_deleted", false)
        .order("name", { ascending: true });

      let queryHidden = supabase
        .from("TrashView")
        .select("*");

      if (signal) {
        queryAll = queryAll.abortSignal(signal);
        queryHidden = queryHidden.abortSignal(signal);
      }

      const [allResponse, hiddenResponse] = await Promise.all([
        queryAll,
        queryHidden
      ]);

      const { data: allCategories, error: errCat } = allResponse;
      const { data: hidden, error: errHidden } = hiddenResponse;

      if (errCat || errHidden) {
        throw errCat || errHidden;
      }

      const visibleCategories = allCategories.filter(
        (cat) => !hidden.some((h) => h.id === cat.id),
      );

      setCategories(visibleCategories);
      setHiddenCategories(hidden);
      lastSuccessfullyFetchedRef.current = true;
      return { success: true };
    } catch (error) {
      const isAbortError = error.name === "AbortError" || error.message?.includes("AbortError");
      if (!isAbortError) {
        console.error("Error al obtener las categorías:", error);
        return {
          success: false,
          message: "Error al obtener las categorías: " + translateSupabaseError(error),
        };
      }
    } finally {
      if (!signal || !signal.aborted) {
        setIsFetching(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, [fetchCategories]);

  async function addCategory(name, type, icon = "IconCoin") {
    const cleanName = name.trim();
    if (!cleanName) return { success: false, message: "El nombre es requerido" };

    const formattedName =
      cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

    if (
      categories.some(
        (c) =>
          c.name.toLowerCase() === formattedName.toLowerCase() &&
          c.type === type,
      )
    ) {
      return {
        success: false,
        message: "Ya existe una categoría activa con ese nombre.",
      };
    }

    const categoryToRestore = hiddenCategories.find(
      (cat) =>
        cat.name.toLowerCase() === formattedName.toLowerCase() &&
        cat.type === type,
    );

    if (categoryToRestore) {
      return {
        success: false,
        code: "DUPLICATE_HIDDEN",
        categoryToRestore,
        message: `Ya existe una categoría oculta con ese nombre. ¿Deseas mostrarla?`,
      };
    }

    const { error: insertError } = await supabase.from("Category").insert({
      name: formattedName,
      type: type,
      user_id: user.id,
      icon: icon,
    });

    if (insertError) {
      return { success: false, message: "Error al agregar la categoría: " + translateSupabaseError(insertError) };
    }

    await fetchCategories();
    return { success: true, message: "Categoría agregada con éxito" };
  }

  async function editCategory(category, newName, type, icon) {
    const cleanName = newName.trim();
    if (!cleanName) return { success: false, message: "El nombre es requerido" };

    const formattedName =
      cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

    const nameChanged = formattedName !== category.name;
    const iconChanged = icon && icon !== category.icon;

    if (!nameChanged && !iconChanged) return { success: true };

    if (nameChanged) {
      if (
        categories.some(
          (c) =>
            c.id !== category.id &&
            c.name.toLowerCase() === formattedName.toLowerCase() &&
            c.type === type,
        )
      ) {
        return { success: false, message: "Ya existe una categoría activa con ese nombre." };
      }

      if (
        hiddenCategories.some(
          (c) =>
            c.id !== category.id &&
            c.name.toLowerCase() === formattedName.toLowerCase() &&
            c.type === type,
        )
      ) {
        return {
          success: false,
          message: "Ya existe una categoría oculta con ese nombre, puedes mostrarla desde la papelera",
        };
      }
    }

    const updateFields = { name: formattedName };
    if (icon) {
      updateFields.icon = icon;
    }

    const { error } = await supabase
      .from("Category")
      .update(updateFields)
      .eq("id", category.id);

    if (error) {
      return { success: false, message: "Error al editar la categoría: " + translateSupabaseError(error) };
    }

    await fetchCategories();
    return { success: true, message: "Categoría editada con éxito" };
  }

  async function deleteCategory(category_id, is_global) {
    const query = is_global
      ? supabase
          .from("HiddenCategory")
          .insert([{ user_id: user.id, category_id }])
      : supabase
          .from("Category")
          .update({ is_deleted: true })
          .eq("id", category_id);

    const { error } = await query;

    if (error) {
      return {
        success: false,
        message: `Error al ${is_global ? "ocultar" : "eliminar"} la categoría: ${translateSupabaseError(error)}`,
      };
    }

    await fetchCategories();
    return { success: true, message: "Categoría eliminada con éxito" };
  }

  async function unhideCategory(category) {
    const query = category.is_global
      ? supabase
          .from("HiddenCategory")
          .delete()
          .eq("category_id", category.id)
          .eq("user_id", user.id)
      : supabase
          .from("Category")
          .update({ is_deleted: false })
          .eq("id", category.id);

    const { error } = await query;

    if (error) {
      return { success: false, message: "No se pudo mostrar la categoría: " + translateSupabaseError(error) };
    }

    await fetchCategories();
    return { success: true, message: "Categoría restaurada con éxito" };
  }

  return {
    categories,
    hiddenCategories,
    loading,
    fetchCategories,
    addCategory,
    editCategory,
    deleteCategory,
    unhideCategory,
  };
}
