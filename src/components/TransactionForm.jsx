import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { transactionService } from "../services/transactionService";
import { useCategories } from "../hooks/useCategories";
import { useWalletContext } from "../contexts/WalletContext";
import { CURRENCIES } from "../constants/currencies";
import { toast } from "sonner";
import Select from "./Select";
import DateInput from "./DateInput";
import { translateSupabaseError } from "../utilities/supabaseErrors";

export function TransactionForm({
  onTransactionAdded,
  onTransactionUpdated,
  transactionToEdit,
  initialData,
  user,
}) {
  const [type, setType] = useState("expense");
  const { categories, loading: loadingCategories } = useCategories(user);
  const { wallets, loading: loadingWallets, activeWalletId, refetch: refetchWallets } = useWalletContext();
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
  const [walletId, setWalletId] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-seleccionar cartera por defecto
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || "expense");
      setAmount(transactionToEdit.amount ? String(transactionToEdit.amount) : "");
      setDescription(transactionToEdit.note || "");
      setDate(
        transactionToEdit.transaction_date
          ? transactionToEdit.transaction_date.split("T")[0]
          : getTodayDateString()
      );
      setCategoryId(transactionToEdit.category_id || "");
      setWalletId(transactionToEdit.wallet_id || "");
    } else if (initialData) {
      setType(initialData.type || "expense");
      setAmount(initialData.amount ? String(initialData.amount) : "");
      setDescription(initialData.description || initialData.note || "");
      setDate(initialData.date ? initialData.date.split("T")[0] : getTodayDateString());
      setCategoryId(initialData.categoryId || initialData.category_id || "");
      setWalletId(initialData.walletId || initialData.wallet_id || activeWalletId || (wallets[0]?.id || ""));
    } else {
      setType("expense");
      setAmount("");
      setDescription("");
      setDate(getTodayDateString());
      setCategoryId("");
      setWalletId(activeWalletId || (wallets[0]?.id || ""));
    }
  }, [transactionToEdit, initialData, activeWalletId, wallets]);

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

  const selectedWallet = useMemo(() => {
    return wallets.find((w) => w.id === walletId) || null;
  }, [wallets, walletId]);

  const currencyInfo = useMemo(() => {
    const code = selectedWallet ? selectedWallet.currency : "USD";
    return CURRENCIES[code] || CURRENCIES.USD;
  }, [selectedWallet]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (!amount || Number(amount) <= 0) {
      toast.warning("El monto debe ser mayor a 0");
      setAmount("");
      setLoading(false);
      return;
    }

    if (!walletId) {
      toast.warning("Debes seleccionar una cartera para el movimiento");
      setLoading(false);
      return;
    }

    const currentCurrency = selectedWallet ? selectedWallet.currency : "USD";
    let result;

    if (transactionToEdit) {
      result = await transactionService.updateTransaction(user.id, transactionToEdit.id, {
        amount,
        note: description,
        categoryId: categoryId || null,
        walletId,
        type,
        date,
        currency: currentCurrency,
      });
    } else {
      result = await transactionService.createTransaction(user.id, {
        amount,
        note: description,
        categoryId: categoryId || null,
        walletId,
        type,
        date,
        currency: currentCurrency,
      });
    }

    const { error } = result;

    if (error) {
      toast.error(
        `Error al ${transactionToEdit ? "actualizar" : "agregar"} la transacción: ` +
          translateSupabaseError(error)
      );
    } else {
      refetchWallets();
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
        {/* Selector de Cartera */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="wallet_id" className="text-xs font-semibold text-(--text-color) tracking-wide">
              Cartera / Cuenta
            </label>
            {selectedWallet && (
              <span className="text-[11px] font-bold text-(--primary-color)">
                {selectedWallet.currency}
              </span>
            )}
          </div>
          {wallets.length === 0 && !loadingWallets ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 space-y-1.5">
              <p className="font-semibold">Aún no tienes carteras creadas.</p>
              <p className="text-[11px] opacity-90">
                Para registrar tus movimientos, primero necesitas una cuenta o billetera.
              </p>
              <Link
                to="/wallets"
                className="inline-block font-bold text-(--primary-color) underline hover:opacity-80 pt-0.5"
              >
                Crear mi primera cartera →
              </Link>
            </div>
          ) : (
            <Select
              id="wallet_id"
              value={walletId}
              onChange={setWalletId}
              options={wallets.map((w) => ({
                value: w.id,
                label: `${w.name} (${w.currency})`,
              }))}
              placeholder="Selecciona una cartera"
              disabled={loadingWallets}
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-xs font-semibold text-(--text-color) tracking-wide">
            Monto ({currencyInfo.code})
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-sm font-bold text-(--text-color)/60">
              {currencyInfo.symbol || currencyInfo.code}
            </span>
            <input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e)}
              step="0.0001"
              required
              className="w-full pl-10 pr-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
            />
          </div>
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
            className="w-full px-4 py-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder-(--text-color)/50 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all duration-300"
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
