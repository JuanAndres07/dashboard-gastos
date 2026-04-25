import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import CategoryList from "../components/CategoryList";

export default function Categories({ user }) {
  const [categories, setCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const [viewMode, setViewMode] = useState("expense");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data: allCategories, error: errCat } = await supabase
      .from("Category")
      .select("*")
      .eq("is_deleted", false)
      .order("name", { ascending: true });

    const { data: hidden, error: errHidden } = await supabase
      .from("TrashView")
      .select("*");

    if (errCat || errHidden) {
      alert(
        "Error al obtener las categorías: " +
          (errCat?.message || errHidden?.message),
      );
      return;
    }

    const visibleCategories = allCategories.filter(
      (cat) => !hidden.some((h) => h.id === cat.id),
    );

    setCategories(visibleCategories);
    setHiddenCategories(hidden);
  }

  async function handleAddCategory(e) {
    e.preventDefault();

    const cleanName = newName.trim();
    if (!cleanName) return;

    const formattedName =
      cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

    if (
      categories.some(
        (c) =>
          c.name.toLowerCase() === formattedName.toLowerCase() &&
          c.type === viewMode,
      )
    ) {
      alert(
        "Ya existe una categoría activa con ese nombre. (error detectado dentro del if)",
      );
      setNewName("");
      return;
    }

    const categoryToRestore = hiddenCategories.find(
      (cat) =>
        cat.name.toLowerCase() === formattedName.toLowerCase() &&
        cat.type === viewMode,
    );

    if (categoryToRestore) {
      await handleUnhideCategory(
        categoryToRestore,
        `Ya existe una categoría oculta con ese nombre. ¿Deseas mostrarla?`,
      );
      setNewName("");
      return;
    }

    const { error: insertError } = await supabase.from("Category").insert({
      name: formattedName,
      type: viewMode,
      user_id: user.id,
    });

    if (insertError) {
      alert("Error al agregar la categoría: " + insertError.message);
      return;
    }

    setNewName("");
    fetchCategories();
  }

  async function handleEditCategory(category, newName) {
    const cleanName = newName.trim();
    if (!cleanName || cleanName === category.name) return;

    const formattedName =
      cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

    if (
      categories.some(
        (c) =>
          c.id !== category.id &&
          c.name.toLowerCase() === formattedName.toLowerCase() &&
          c.type === viewMode,
      )
    ) {
      alert("Ya existe una categoría activa con ese nombre.");
      return;
    }

    const { error } = await supabase
      .from("Category")
      .update({ name: formattedName })
      .eq("id", category.id);

    if (error) {
      alert("Error al editar la categoría: " + error.message);
    } else {
      fetchCategories();
    }
  }

  async function handleDeleteCategory(category_id, is_global) {
    const actionLabel = is_global ? "ocultar" : "eliminar";
    if (
      !window.confirm(`¿Estás seguro que deseas ${actionLabel} esta categoría?`)
    )
      return;

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
      alert(`Error al ${actionLabel} la categoría: ${error.message}`);
    } else {
      fetchCategories();
    }
  }

  async function handleUnhideCategory(
    category,
    message = "¿Estás seguro que deseas mostrar esta categoría?",
  ) {
    if (!window.confirm(message)) return;

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
      alert("No se pudo mostrar la categoría: " + error.message);
    } else {
      fetchCategories();
    }
  }

  return (
    <div>
      <h1>Gestionar categorías</h1>

      <div>
        <button onClick={() => setViewMode("expense")}>
          Ver categorías de Gastos
        </button>
        <button onClick={() => setViewMode("income")}>
          Ver categorías de Ingresos
        </button>
      </div>

      <form onSubmit={handleAddCategory}>
        <input
          type="text"
          placeholder={`Nombre de la categoría de ${viewMode}`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit">Agregar</button>
      </form>

      <hr />

      <h3>Tus categorías</h3>

      <CategoryList
        title={viewMode === "expense" ? "Gastos" : "Ingresos"}
        list={categories.filter((cat) => cat.type === viewMode)}
        onAction={(cat) => handleDeleteCategory(cat.id, !cat.user_id)}
        onEdit={handleEditCategory}
        color={viewMode === "expense" ? "red" : "green"}
      />

      <div>
        <button onClick={() => setShowHidden(!showHidden)}>
          {showHidden ? "🔼 Ocultar papelera" : "🔽 Mostrar papelera"}
        </button>

        {showHidden && (
          <CategoryList
            title={
              viewMode === "expense" ? "Gastos ocultos" : "Ingresos ocultos"
            }
            list={hiddenCategories.filter((cat) => cat.type === viewMode)}
            onAction={(cat) => handleUnhideCategory(cat)}
            onLabel="Recuperar"
            color="gray"
          />
        )}
      </div>
    </div>
  );
}
