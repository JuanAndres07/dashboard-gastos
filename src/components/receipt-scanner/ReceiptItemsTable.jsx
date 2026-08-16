import { useMemo } from "react";
import {
  IconTrash,
  IconPlus,
  IconReceipt,
  IconListCheck,
  IconSparkles,
} from "@tabler/icons-react";
import Select from "../Select";
import { generateId, sumItems } from "../../utilities/scanTotals";
import { SAVE_MODES } from "../../utilities/scanConstants";
import { autoAssignCategories } from "../../utilities/categorySuggester";
import { toast } from "sonner";

export function ReceiptItemsTable({
  items,
  onItemsChange,
  saveMode,
  onSaveModeChange,
  categories = [],
  singleCategoryId,
  onSingleCategoryIdChange,
}) {
  const handleItemChange = (id, field, value) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onItemsChange(updated);
  };

  const handleAddItem = () => {
    const newItem = {
      id: generateId(),
      description: "",
      amount: "",
      categoryId: "",
    };
    onItemsChange([...items, newItem]);
  };

  const handleDeleteItem = (id) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const handleAutoCategorize = () => {
    const prevCategoryMap = new Map(items.map((item) => [item.id, item.categoryId]));
    const updated = autoAssignCategories(items, categories);
    const assignedCount = updated.filter(
      (item) => !prevCategoryMap.get(item.id) && item.categoryId,
    ).length;
    onItemsChange(updated);

    if (assignedCount > 0) {
      toast.success(`Se asignaron automáticamente ${assignedCount} categorías`);
    } else {
      toast.info(
        "No se encontraron nuevas sugerencias para los productos actuales",
      );
    }
  };

  const categoryOptions = useMemo(() => {
    return categories
      .filter((c) => c.type === "expense")
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      }));
  }, [categories]);

  const itemsSum = sumItems(items).toFixed(2);

  return (
    <div className="space-y-5 text-left">
      {/* Modalidad de Registro */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-(--headings-color)">
          ¿Cómo deseas registrar este gasto?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSaveModeChange(SAVE_MODES.SINGLE)}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-start gap-3 transition-all cursor-pointer ${
              saveMode === SAVE_MODES.SINGLE
                ? "bg-(--primary-color)/5 border-(--primary-color) text-(--primary-color) shadow-2xs"
                : "border-(--sidebar-border) bg-transparent text-(--text-color) hover:text-(--headings-color) hover:border-(--headings-color)/30"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                saveMode === SAVE_MODES.SINGLE
                  ? "bg-(--primary-color) text-white"
                  : "bg-(--bg-light) text-(--text-color)"
              }`}
            >
              <IconReceipt size={18} />
            </div>
            <div className="text-left">
              <div className="font-bold">Factura Completa (1 Gasto)</div>
              <div className="text-[11px] font-normal text-(--text-color)/80">
                Guarda el monto total e incluye el detalle en la nota.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSaveModeChange(SAVE_MODES.MULTIPLE)}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-start gap-3 transition-all cursor-pointer ${
              saveMode === SAVE_MODES.MULTIPLE
                ? "bg-(--primary-color)/5 border-(--primary-color) text-(--primary-color) shadow-2xs"
                : "border-(--sidebar-border) bg-transparent text-(--text-color) hover:text-(--headings-color) hover:border-(--headings-color)/30"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                saveMode === SAVE_MODES.MULTIPLE
                  ? "bg-(--primary-color) text-white"
                  : "bg-(--bg-light) text-(--text-color)"
              }`}
            >
              <IconListCheck size={18} />
            </div>
            <div className="text-left">
              <div className="font-bold">Desglose por Producto</div>
              <div className="text-[11px] font-normal text-(--text-color)/80">
                Registra cada producto como un gasto independiente.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Selector de categoría única si está en modo SINGLE */}
      {saveMode === SAVE_MODES.SINGLE && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-(--headings-color) block">
            Categoría general del comprobante
          </label>
          <Select
            value={singleCategoryId || ""}
            onChange={onSingleCategoryIdChange}
            options={categoryOptions}
            placeholder="Selecciona una categoría..."
            btnClassName="!bg-(--bg-light) h-10.5 py-0 px-3.5 text-xs font-semibold rounded-xl"
          />
        </div>
      )}

      {/* Cabecera y Lista de Productos */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-(--headings-color)">
              Productos Detectados ({items.length})
            </span>
            {saveMode === SAVE_MODES.MULTIPLE && items.length > 0 && (
              <button
                type="button"
                onClick={handleAutoCategorize}
                className="px-2.5 py-1 bg-(--primary-color)/10 hover:bg-(--primary-color)/20 text-(--primary-color) text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-(--primary-color)/20"
                title="Detectar categorías automáticamente según los nombres"
              >
                <IconSparkles size={13} />
                <span>Auto-categorizar</span>
              </button>
            )}
          </div>

          <span className="text-xs font-bold text-(--headings-color)">
            Suma:{" "}
            <span className="text-(--primary-color) text-sm font-extrabold">
              ${itemsSum}
            </span>
          </span>
        </div>

        {/* Encabezados de columna */}
        {items.length > 0 && (
          <div className="hidden sm:flex gap-2 px-1 text-[11px] font-semibold text-(--text-color)/80 uppercase tracking-wider">
            <span className="flex-1">Descripción del Producto</span>
            <span className="w-32">Monto ($)</span>
            {saveMode === SAVE_MODES.MULTIPLE && (
              <span className="w-44">Categoría</span>
            )}
            <span className="w-8 text-center"></span>
          </div>
        )}

        {/* Lista de productos sin cajas grises anidadas */}
        <div className="max-h-90 overflow-y-auto space-y-2.5 pr-1">
          {items.length === 0 ? (
            <div className="text-center py-8 text-(--text-color) space-y-2 border border-dashed border-(--sidebar-border) rounded-2xl">
              <p className="text-xs">
                No se encontraron líneas de productos individuales.
              </p>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-(--primary-color) hover:underline cursor-pointer"
              >
                + Añadir el primer producto manualmente
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id || index}
                className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
              >
                {/* Nombre de Producto */}
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(item.id, "description", e.target.value)
                  }
                  className="flex-1 min-w-0 h-10 px-3.5 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-xs font-medium text-(--headings-color) focus:outline-none focus:border-(--primary-color)"
                />

                {/* Monto */}
                <div className="w-full sm:w-32 relative flex items-center shrink-0">
                  <span className="absolute left-3 text-xs font-semibold text-(--text-color)">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={item.amount}
                    onChange={(e) =>
                      handleItemChange(item.id, "amount", e.target.value)
                    }
                    className="w-full h-10 pl-7 pr-3 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-xs font-semibold text-(--headings-color) focus:outline-none focus:border-(--primary-color)"
                  />
                </div>

                {/* Categoría si es Desglose por Producto */}
                {saveMode === SAVE_MODES.MULTIPLE && (
                  <div className="w-full sm:w-44 shrink-0">
                    <Select
                      value={item.categoryId || ""}
                      onChange={(val) =>
                        handleItemChange(item.id, "categoryId", val)
                      }
                      options={categoryOptions}
                      placeholder="Categoría..."
                      btnClassName="!bg-(--bg-light) h-10 py-0 pl-3 pr-7 text-xs font-medium rounded-xl"
                    />
                  </div>
                )}

                {/* Eliminar */}
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer self-end sm:self-center shrink-0"
                  title="Eliminar producto"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Botón para Añadir Producto Manual */}
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full py-2.5 px-3 border border-dashed border-(--primary-color)/50 text-(--primary-color) hover:bg-(--primary-color)/5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <IconPlus size={16} />
          <span>Añadir Producto Manualmente</span>
        </button>
      </div>
    </div>
  );
}
