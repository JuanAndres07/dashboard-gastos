import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data: allCategories, error: errCat } = await supabase
      .from("Category")
      .select("*")
      .order("name", { ascending: true });

    const { data: hidden, error: errHidden } = await supabase
      .from("HiddenCategories")
      .select("category_id");

    if (errCat || errHidden) {
      alert(
        "Error al obtener las categorías: " + errCat?.message ||
          errHidden?.message,
      );
      return;
    }

    const hiddenIds = hidden?.map((h) => h.category_id || []);

    const visibleCategories = allCategories.filter(
      (cat) => !hiddenIds.includes(cat.id),
    );

    setCategories(visibleCategories);
  }

  async function handleAddCategory(e) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("Category").insert({
      name: newCategory,
      user_id: user.id,
    });

    if (error) {
      alert("Error al agregar la categoría: " + error.message);
    } else {
      setNewCategory("");
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
        .from("HiddenCategories")
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

  return (
    <div>
      <h1>Gestionar categorías</h1>

      <form onSubmit={handleAddCategory}>
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          required
        />
        <button type="submit">Agregar</button>
      </form>

      <hr />

      <h3>Tus categorías</h3>

      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            {category.name}
            {category.user_id ? "👤" : "🌐"}
            <button
              onClick={() =>
                handleDeleteCategory(category.id, !category.user_id)
              }
            >
              {category.user_id ? "Eliminar" : "Ocultar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
