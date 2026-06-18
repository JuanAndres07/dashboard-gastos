import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCategories } from "../hooks/useCategories";
import { toast } from "sonner";
import Select from "./Select";
import DateInput from "./DateInput";
import { translateSupabaseError } from "../utilities/supabaseErrors";

export function TransactionForm({ onTransactionAdded, onTransactionUpdated, transactionToEdit, user }) {
  const [type, setType] = useState("expense");
  const { categories, loading: loadingCategories } = useCategories(user);
  const [filteredCategories, setFilteredCategories] = useState([]);

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayDateString);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || "expense");
      setAmount(transactionToEdit.amount ? String(transactionToEdit.amount) : "");
      setDescription(transactionToEdit.note || "");
      setDate(transactionToEdit.transaction_date ? transactionToEdit.transaction_date.split("T")[0] : getTodayDateString());
      setCategoryId(transactionToEdit.category_id || "");
    } else {
      setType("expense");
      setAmount("");
      setDescription("");
      setDate(getTodayDateString());
      setCategoryId("");
    }
  }, [transactionToEdit]);

  useEffect(() => {
    const filtered = categories.filter((cat) => cat.type === type);
    setFilteredCategories(filtered);
    
    setCategoryId((prev) => {
      if (transactionToEdit && transactionToEdit.type === type && transactionToEdit.category_id === prev) {
        return prev;
      }
      const exists = filtered.some((cat) => cat.id === prev);
      return exists ? prev : "";
    });
  }, [categories, type, transactionToEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (!amount || Number(amount) <= 0) {
      toast.warning("El monto debe ser mayor a 0");
      setAmount("");
      setLoading(false);
      return;
    }

    let result;
    if (transactionToEdit) {
      result = await supabase
        .from("Transaction")
        .update({
          amount: amount,
          note: description,
          category_id: categoryId,
          type: type,
          transaction_date: date,
        })
        .eq("id", transactionToEdit.id)
        .eq("user_id", user.id);
    } else {
      result = await supabase.from("Transaction").insert([
        {
          amount: amount,
          note: description,
          category_id: categoryId,
          user_id: user.id,
          type: type,
          transaction_date: date,
        },
      ]);
    }

    const { error } = result;

    if (error) {
      toast.error(`Error al ${transactionToEdit ? "actualizar" : "agregar"} la transacción: ` + translateSupabaseError(error));
    } else {
      if (!transactionToEdit) {
        setAmount("");
        setDescription("");
        setCategoryId("");
        setDate(getTodayDateString());
      }

      if (transactionToEdit) {
        if (onTransactionUpdated) {
          onTransactionUpdated();
        }
        toast.success("Transacción actualizada correctamente");
      } else {
        if (onTransactionAdded) {
          onTransactionAdded();
        }
        toast.success("Transacción agregada correctamente");
      }
    }
    setLoading(false);
  }

  function handleAmountChange(e) {
    const value = e.target.value;
    const decimal = value.split(".");

    if (decimal.length > 1 && decimal[1].length > 4) {
      return;
    }
    setAmount(value);
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex bg-(--bg-light) p-1 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
            type === "expense"
              ? "bg-(--danger-color) text-white shadow-md shadow-danger/10"
              : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
          }`}
        >
          Egreso
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
            type === "income"
              ? "bg-(--success-color) text-white shadow-md shadow-success/10"
              : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
          }`}
        >
          Ingreso
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-xs font-semibold text-(--text-color) tracking-wide">
            Monto
          </label>
          <input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e)}
            step="0.0001"
            required
            className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--text-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-xs font-semibold text-(--text-color) tracking-wide">
            Descripción
          </label>
          <input
            id="description"
            type="text"
            placeholder="Ej. Supermercado, Alquiler, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--text-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="transaction_date" className="text-xs font-semibold text-(--text-color) tracking-wide">
            Fecha
          </label>
          <DateInput
            id="transaction_date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category_id" className="text-xs font-semibold text-(--text-color) tracking-wide">
            Categoría
          </label>
          <Select
            id="category_id"
            value={categoryId}
            onChange={setCategoryId}
            options={filteredCategories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            placeholder="Selecciona una categoría"
            disabled={loadingCategories}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-(--primary-color) text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] cursor-pointer mt-2"
        >
          {loading 
            ? (transactionToEdit ? "Guardando..." : "Agregando...") 
            : (transactionToEdit ? "Guardar Cambios" : `Agregar ${type === "expense" ? "Egreso" : "Ingreso"}`)}
        </button>
      </form>
    </div>
  );
}
