import { useState, useEffect, useMemo } from "react";
import { formatCurrency, formatLocalDate } from "../utilities/formatters";
import { toast } from "sonner";
import { useCategories } from "./useCategories";

export function useTransferForm({
  isOpen,
  onClose,
  onSubmit,
  wallets = [],
  initialFromWallet = null,
  user,
}) {
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amountFrom, setAmountFrom] = useState("");
  const [amountTo, setAmountTo] = useState("");
  const [fee, setFee] = useState("");
  const [feeCategoryId, setFeeCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => formatLocalDate(new Date()));
  const [loading, setLoading] = useState(false);

  const { categories } = useCategories(user);
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  useEffect(() => {
    if (isOpen) {
      const defaultFrom = initialFromWallet?.id || (wallets.length > 0 ? wallets[0].id : "");
      setFromWalletId(defaultFrom);

      const otherWallet = wallets.find((w) => w.id !== defaultFrom);
      setToWalletId(otherWallet ? otherWallet.id : "");

      setAmountFrom("");
      setAmountTo("");
      setFee("");
      setFeeCategoryId("");
      setNote("");
      setDate(formatLocalDate(new Date()));
    }
  }, [isOpen, initialFromWallet, wallets]);

  const fromWallet = useMemo(
    () => wallets.find((w) => w.id === fromWalletId) || null,
    [wallets, fromWalletId]
  );

  const toWallet = useMemo(
    () => wallets.find((w) => w.id === toWalletId) || null,
    [wallets, toWalletId]
  );

  const isSameCurrency = fromWallet && toWallet && fromWallet.currency === toWallet.currency;

  const handleAmountFromChange = (val) => {
    setAmountFrom(val);
    if (isSameCurrency) {
      setAmountTo(val);
    }
  };

  const computedExchangeRate = useMemo(() => {
    const numFrom = Number(amountFrom);
    const numTo = Number(amountTo);
    if (numFrom > 0 && numTo > 0) {
      return (numFrom / numTo).toFixed(4);
    }
    return null;
  }, [amountFrom, amountTo]);

  const handleFromWalletChange = (val) => {
    setFromWalletId(val);
    if (val === toWalletId) {
      const alt = wallets.find((w) => w.id !== val);
      if (alt) setToWalletId(alt.id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fromWallet || !toWallet) {
      toast.warning("Selecciona las carteras de origen y destino");
      return;
    }

    if (fromWallet.id === toWallet.id) {
      toast.warning("La cartera de origen y destino deben ser distintas");
      return;
    }

    const numFrom = Number(amountFrom);
    const numTo = Number(amountTo);
    const numFee = Number(fee) || 0;

    if (numFrom <= 0 || numTo <= 0) {
      toast.warning("Los montos de transferencia deben ser mayores a 0");
      return;
    }

    if (fromWallet.balance < numFrom + numFee) {
      toast.warning(
        `Saldo insuficiente en ${fromWallet.name}. Disponible: ${formatCurrency(
          fromWallet.balance,
          fromWallet.currency
        )}`
      );
      return;
    }

    setLoading(true);
    const payload = {
      fromWallet,
      toWallet,
      amountFrom: numFrom,
      amountTo: numTo,
      fee: numFee,
      feeCategoryId: feeCategoryId || null,
      exchangeRate: computedExchangeRate ? parseFloat(computedExchangeRate) : 1.0,
      note: note.trim(),
      date,
    };

    const result = await onSubmit(payload);
    setLoading(false);

    if (result?.success) {
      onClose();
    }
  };

  return {
    fromWalletId,
    toWalletId,
    setToWalletId,
    fromWallet,
    toWallet,
    amountFrom,
    amountTo,
    setAmountTo,
    fee,
    setFee,
    feeCategoryId,
    setFeeCategoryId,
    note,
    setNote,
    date,
    setDate,
    loading,
    expenseCategories,
    isSameCurrency,
    computedExchangeRate,
    handleAmountFromChange,
    handleFromWalletChange,
    handleSubmit,
  };
}
