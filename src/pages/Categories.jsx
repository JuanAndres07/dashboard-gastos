import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("Category")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      console.error("Error al obtener las categorías:", error.message);
    } else {
      setCategories(data || []);
    }
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
            {category.name} {category.user_id ? "👤" : "🌐"}
          </li>
        ))}
      </ul>
    </div>
  );
}
