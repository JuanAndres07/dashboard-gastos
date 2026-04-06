import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function TransactionForm({ onTransactionAdded, user }) {
  const [type, setType] = useState("expense");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data: allCategories, error: errCat } = await supabase
      .from("Category")
      .select("*")
      .order("name", { ascending: true });

    const { data: hiddenCategories, error: errHidden } = await supabase
      .from("HiddenCategory")
      .select("category_id")
      .eq("user_id", user.id);

    if (errCat || errHidden) {
      alert(
        "Error al cargar las categorías: " + errCat?.message ||
          errHidden?.message,
      );
      return;
    }

    const hiddenIds = hiddenCategories?.map((h) => h.category_id || []);

    const visibleCategories =
      allCategories?.filter((cat) => !hiddenIds.includes(cat.id)) || [];

    setCategories(visibleCategories);
  }

  useEffect(() => {
    const filtered = categories.filter((cat) => cat.type === type);
    setFilteredCategories(filtered);
    setCategoryId("");
  }, [categories, type]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("Transaction").insert([
      {
        amount: parseFloat(amount),
        note: description,
        category_id: categoryId,
        user_id: user.id,
        type: type,
      },
    ]);

    if (error) {
      alert("Error al agregar la transacción: " + error.message);
    } else {
      setAmount("");
      setDescription("");
      setCategoryId("");

      if (onTransactionAdded) {
        onTransactionAdded();
        alert("Transacción agregada correctamente");
      }
    }
    setLoading(false);
  }

  return (
    <div>
      <div>
        <button onClick={() => setType("expense")}>Egreso</button>
        <button onClick={() => setType("income")}>Ingreso</button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          name="category"
          id="category_id"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>

          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Agregando..." : "Agregar "}
          {type === "expense" ? "Egreso" : "Ingreso"}
        </button>
      </form>
    </div>
  );
}
