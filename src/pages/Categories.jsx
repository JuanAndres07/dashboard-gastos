import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import CategoryList from "../components/CategoryList";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const [viewMode, setViewMode] = useState("expense");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: allCategories, error: errCat } = await supabase
      .from("Category")
      .select("*")
      .order("name", { ascending: true });

    const { data: hidden, error: errHidden } = await supabase
      .from("HiddenCategory")
      .select("category_id")
      .eq("user_id", user.id);

    if (errCat || errHidden) {
      alert(
        "Error al obtener las categorías: " +
          (errCat?.message || errHidden?.message),
      );
      return;
    }

    const hiddenIds = hidden?.map((h) => h.category_id) || [];

    const visibleCategories = allCategories.filter(
      (cat) => !hiddenIds.includes(cat.id),
    );

    const hiddenCategories = allCategories.filter((cat) =>
      hiddenIds.includes(cat.id),
    );

    setCategories(visibleCategories);
    setHiddenCategories(hiddenCategories);
  }

  async function handleAddCategory(e) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("Category").insert({
      name: newName,
      type: viewMode,
      user_id: user.id,
    });

    if (error) {
      alert("Error al agregar la categoría: " + error.message);
    } else {
      setNewName("");
      fetchCategories();
    }
  }

  async function handleDeleteCategory(category_id, is_global) {
    if (is_global) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const confirmation = window.confirm(
        "¿Estás seguro que deseas ocultar esta categoría?",
      );
      if (!confirmation) return;

      const { error } = await supabase
        .from("HiddenCategory")
        .insert([{ user_id: user.id, category_id: category_id }]);

      if (error) {
        alert("No se pudo ocultar la categoría: " + error.message);
      } else {
        fetchCategories();
      }
    } else {
      const confirmation = window.confirm(
        "¿Estás seguro que deseas eliminar esta categoría?",
      );
      if (!confirmation) return;

      const { error } = await supabase
        .from("Category")
        .delete()
        .eq("id", category_id);

      if (error) {
        alert("Error al eliminar la categoría: " + error.message);
      } else {
        fetchCategories();
      }
    }
  }

  async function handleUnhideCategory(category_id) {
    const confirmation = window.confirm(
      "¿Estás seguro que deseas mostrar esta categoría?",
    );
    if (!confirmation) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error, count } = await supabase
      .from("HiddenCategory")
      .delete({ count: "exact" })
      .eq("category_id", category_id)
      .eq("user_id", session.user.id);

    if (error) {
      alert("No se pudo mostrar la categoría: " + error.message);
    } else if (count === 0) {
      alert("No se encontró la categoría para mostrar");
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
            onAction={(cat) => handleUnhideCategory(cat.id)}
            onLabel="Recuperar"
            color="gray"
          />
        )}
      </div>
    </div>
  );
}
