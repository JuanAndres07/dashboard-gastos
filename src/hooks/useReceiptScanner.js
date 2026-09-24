import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCamera } from "./useCamera";
import { useReceiptOCR } from "./useReceiptOCR";
import { useCategories } from "./useCategories";
import { useWalletContext } from "../contexts/WalletContext";
import { transactionService } from "../services/transactionService";
import { translateSupabaseError } from "../utilities/supabaseErrors";
import { getDisplayTotal } from "../utilities/scanTotals";
import { SOURCE_MODES, SAVE_MODES } from "../utilities/scanConstants";
import { autoAssignCategories } from "../utilities/categorySuggester";

/**
 * Hook para la lógica y estado del escaneo de facturas en la vista dedicada.
 */
export function useReceiptScanner({ user, isActive = true }) {
  const navigate = useNavigate();
  const [sourceMode, setSourceMode] = useState(SOURCE_MODES.CAMERA);
  const [imageSrc, setImageSrc] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [saveMode, setSaveMode] = useState(SAVE_MODES.SINGLE);
  const [singleCategoryId, setSingleCategoryId] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customDate, setCustomDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [isSaving, setIsSaving] = useState(false);

  const { categories } = useCategories(user);

  const { wallets, activeWalletId } = useWalletContext();
  const targetWallet = wallets.find((w) => w.id === activeWalletId) || wallets[0] || null;
  const defaultWalletId = targetWallet?.id || null;
  const defaultCurrency = targetWallet?.currency || "USD";
  const {
    isScanning,
    progress,
    statusText,
    errorText,
    processReceipt,
    cancelOCR,
  } = useReceiptOCR();

  const displayTotal = getDisplayTotal(scannedItems, parsedData);

  const handleImageSelected = (dataUrl) => {
    setImageSrc(dataUrl);
    processReceipt(dataUrl, (extracted) => {
      setParsedData(extracted);
      if (extracted.description) {
        setCustomDescription(extracted.description);
      }
      if (extracted.date) {
        setCustomDate(extracted.date);
      }
      // Auto-asignar categorías a los items detectados
      const itemsWithCategories = autoAssignCategories(extracted.items || [], categories);
      setScannedItems(itemsWithCategories);
    });
  };

  const {
    videoRef,
    canvasRef,
    cameraError,
    cameraReady,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
    handleLoadedMetadata,
  } = useCamera({
    isActive: isActive && sourceMode === SOURCE_MODES.CAMERA && !imageSrc && !isScanning,
    onCapture: handleImageSelected,
  });

  const handleResetAll = () => {
    setImageSrc(null);
    setParsedData(null);
    setScannedItems([]);
    setSaveMode(SAVE_MODES.SINGLE);
    setSingleCategoryId("");
    setCustomDescription("");
    setCustomDate(new Date().toISOString().split("T")[0]);
    cancelOCR();
  };

  // Guardar directo a Supabase
  const handleSaveToDatabase = async () => {
    if (!user?.id) {
      toast.error("Debes iniciar sesión para registrar gastos");
      return;
    }

    const numericAmount = parseFloat(displayTotal);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.warning("El monto total debe ser mayor a 0 para guardar el gasto.");
      return;
    }

    if (!defaultWalletId) {
      toast.error("Crea una cartera antes de escanear una factura.");
      return;
    }

    setIsSaving(true);
    try {
      if (saveMode === SAVE_MODES.MULTIPLE && scannedItems.length > 0) {
        // Múltiples transacciones
        const transactionsToInsert = scannedItems
          .filter((item) => parseFloat(item.amount) > 0)
          .map((item) => ({
            amount: parseFloat(item.amount),
            note: item.description || customDescription || "Gasto escaneado",
            categoryId: item.categoryId || null,
            walletId: defaultWalletId,
            currency: defaultCurrency,
            type: "expense",
            date: customDate,
          }));

        if (transactionsToInsert.length === 0) {
          toast.warning("No hay productos válidos con monto mayor a 0.");
          setIsSaving(false);
          return;
        }

        const { count, error } = await transactionService.createBatchTransactions(
          user.id,
          transactionsToInsert
        );
        if (error) throw error;

        toast.success(`¡${count} gastos registrados con éxito!`);
      } else {
        // Un solo gasto consolidado con detalle en notas
        const itemsSummary =
          scannedItems.length > 0
            ? ` [${scannedItems.map((i) => `${i.description} ($${i.amount})`).join(", ")}]`
            : "";

        const finalNote = (customDescription.trim() || "Gasto escaneado") + itemsSummary;

        const { success, error } = await transactionService.createTransaction(user.id, {
          amount: numericAmount,
          note: finalNote,
          categoryId: singleCategoryId || null,
          walletId: defaultWalletId,
          currency: defaultCurrency,
          type: "expense",
          date: customDate,
        });
        if (!success) throw error;

        toast.success("¡Gasto registrado exitosamente!");
      }

      // Redirigir a transacciones
      navigate("/transactions");
    } catch (err) {
      console.error("Error al guardar el gasto:", err);
      toast.error("Error al guardar: " + translateSupabaseError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    sourceMode,
    setSourceMode,
    imageSrc,
    parsedData,
    scannedItems,
    setScannedItems,
    saveMode,
    setSaveMode,
    singleCategoryId,
    setSingleCategoryId,
    customDescription,
    setCustomDescription,
    customDate,
    setCustomDate,
    categories,
    isScanning,
    progress,
    statusText,
    errorText,
    isSaving,
    displayTotal,
    videoRef,
    canvasRef,
    cameraError,
    cameraReady,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
    handleLoadedMetadata,
    handleImageSelected,
    handleResetAll,
    handleSaveToDatabase,
    targetWallet,
    defaultCurrency,
  };
}
