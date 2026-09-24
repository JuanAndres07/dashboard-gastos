import { useState, useEffect } from "react";
import { WALLET_TYPES } from "../constants/currencies";
import { toast } from "sonner";

export function useWalletForm({ walletToEdit, isOpen, onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [currency, setCurrency] = useState("VES");
  const [initialBalance, setInitialBalance] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [icon, setIcon] = useState("IconBuildingBank");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name || "");
      setType(walletToEdit.type || "bank");
      setCurrency(walletToEdit.currency || "USD");
      setColor(walletToEdit.color || "#3b82f6");
      setIcon(walletToEdit.icon || "IconWallet");
      setInitialBalance("");
    } else {
      setName("");
      setType("bank");
      setCurrency("VES");
      setColor("#0284c7");
      setIcon("IconBuildingBank");
      setInitialBalance("");
    }
  }, [walletToEdit, isOpen]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (!walletToEdit) {
      const typeConfig = WALLET_TYPES[newType];
      if (typeConfig) {
        setCurrency(typeConfig.defaultCurrency);
        setColor(typeConfig.defaultColor);
        setIcon(typeConfig.defaultIcon);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Ingresa un nombre para la cartera");
      return;
    }

    setLoading(true);
    const payload = {
      name: name.trim(),
      type,
      currency,
      color,
      icon,
      initialBalance: initialBalance ? parseFloat(initialBalance) : 0,
    };

    const result = await onSubmit(payload);
    setLoading(false);

    if (result?.success) {
      onClose();
    }
  };

  return {
    name,
    setName,
    type,
    handleTypeChange,
    currency,
    setCurrency,
    initialBalance,
    setInitialBalance,
    color,
    setColor,
    icon,
    setIcon,
    loading,
    handleSubmit,
  };
}
