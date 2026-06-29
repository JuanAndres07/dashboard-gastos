import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useCategories } from "./useCategories";
import { toast } from "sonner";
import { translateSupabaseError } from "../utilities/supabaseErrors";

export function useSubscriptions(user) {
  const { categories, loading: loadingCategories } = useCategories(user);

  // Filtrar solo categorías de tipo egreso
  const expenseCategories = categories.filter((cat) => cat.type === "expense");
  
  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("1 month");
  const [nextPaymentDate, setNextPaymentDate] = useState("");
  
  // List state
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingSubscriptions, setIsFetchingSubscriptions] = useState(true);
  const lastSuccessfullyFetchedSubscriptionsRef = useRef(null);
  const loadingSubscriptions = isFetchingSubscriptions && lastSuccessfullyFetchedSubscriptionsRef.current === null;
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const today = new Date().toISOString().split("T")[0];

  const frequencies = [
    { value: "1 day", label: "Diario" },
    { value: "1 week", label: "Semanal" },
    { value: "1 month", label: "Mensual" },
    { value: "1 year", label: "Anual" },
  ];

  const getFrequencyLabel = (value) => {
    // Normalizar valores que vienen de Postgres (intervals)
    const aliases = {
      "7 days": "1 week",
      "1 mon": "1 month",
    };
    const normalizedValue = aliases[value] || value;
    return frequencies.find((f) => f.value === normalizedValue)?.label || value;
  };

  const fetchSubscriptions = useCallback(async (signal) => {
    if (!user?.id) return;
    setIsFetchingSubscriptions(true);
    try {
      let query = supabase
        .from("Subscription")
        .select(
          `
          *,
          Category (
            name,
            icon
          )
        `,
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("next_payment_date", { ascending: true });

      if (signal) {
        query = query.abortSignal(signal);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubscriptions(data || []);
      lastSuccessfullyFetchedSubscriptionsRef.current = true;
    } catch (error) {
      const isAbortError = error.name === "AbortError" || error.message?.includes("AbortError");
      if (!isAbortError) {
        console.error("Error al cargar suscripciones:", error.message);
      }
    } finally {
      if (!signal || !signal.aborted) {
        setIsFetchingSubscriptions(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSubscriptions(controller.signal);
    return () => controller.abort();
  }, [fetchSubscriptions]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!name || !categoryId || !amount || !frequency || !nextPaymentDate) {
      toast.warning("Por favor completa todos los campos");
      return;
    }

    if (nextPaymentDate < today) {
      toast.warning("La fecha del próximo pago no puede ser anterior a hoy");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("Subscription").insert([
        {
          name,
          user_id: user.id,
          category_id: categoryId,
          amount: parseFloat(amount),
          frequency,
          next_payment_date: nextPaymentDate,
          is_active: true,
        },
      ]);

      if (error) throw error;

      toast.success("Suscripción creada con éxito");
      // Limpiar formulario
      setName("");
      setCategoryId("");
      setAmount("");
      setFrequency("1 month");
      setNextPaymentDate("");
      fetchSubscriptions(); // Recargar lista
    } catch (error) {
      console.error("Error al crear suscripción:", error.message);
      toast.error("Error al crear la suscripción: " + translateSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from("Subscription")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast.success("Suscripción eliminada con éxito");
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    } catch (error) {
      console.error("Error al eliminar suscripción:", error.message);
      toast.error("Error al eliminar la suscripción: " + translateSupabaseError(error));
    }
  };

  const startEdit = (sub) => {
    // Normalizar para que coincida con las opciones del select
    const aliases = {
      "7 days": "1 week",
      "1 mon": "1 month",
    };
    const normalizedFrequency = aliases[sub.frequency] || sub.frequency;

    setEditingId(sub.id);
    setEditValues({
      name: sub.name,
      category_id: sub.category_id,
      amount: sub.amount,
      frequency: normalizedFrequency,
      next_payment_date: sub.next_payment_date ? sub.next_payment_date.split("T")[0] : "",
    });
  };

  const handleUpdate = async (sub) => {
    const aliases = {
      "7 days": "1 week",
      "1 mon": "1 month",
    };
    const normalizedSubFrequency = aliases[sub.frequency] || sub.frequency;

    // Verificar si algo cambió
    const hasChanged = 
      editValues.name !== sub.name ||
      editValues.category_id !== sub.category_id ||
      parseFloat(editValues.amount) !== sub.amount ||
      editValues.frequency !== normalizedSubFrequency ||
      editValues.next_payment_date !== (sub.next_payment_date ? sub.next_payment_date.split("T")[0] : "");

    if (!hasChanged) {
      setEditingId(null);
      return;
    }

    if (editValues.next_payment_date < today) {
      toast.warning("La fecha del próximo pago no puede ser anterior a hoy");
      return;
    }

    try {
      const { error } = await supabase
        .from("Subscription")
        .update({
          name: editValues.name,
          category_id: editValues.category_id,
          amount: parseFloat(editValues.amount),
          frequency: editValues.frequency,
          next_payment_date: editValues.next_payment_date,
        })
        .eq("id", sub.id);

      if (error) throw error;

      toast.success("Suscripción actualizada con éxito");
      setEditingId(null);
      fetchSubscriptions();
    } catch (error) {
      console.error("Error al actualizar suscripción:", error.message);
      toast.error("Error al actualizar la suscripción: " + translateSupabaseError(error));
    }
  };

  return {
    // Data
    subscriptions,
    expenseCategories,
    loading,
    loadingSubscriptions,
    loadingCategories,
    
    // Form values & setters
    name, setName,
    categoryId, setCategoryId,
    amount, setAmount,
    frequency, setFrequency,
    nextPaymentDate, setNextPaymentDate,
    
    // Edit state
    editingId, setEditingId,
    editValues, setEditValues,
    
    // Handlers
    handleSubmit,
    handleDelete,
    startEdit,
    handleUpdate,
    getFrequencyLabel,
    fetchSubscriptions,
    
    // Constants
    frequencies,
    today
  };
}
