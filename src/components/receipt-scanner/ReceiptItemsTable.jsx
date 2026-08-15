import { IconTrash, IconPlus, IconReceipt, IconListCheck, IconInfoCircle } from "@tabler/icons-react";
import Select from "../Select";

export function ReceiptItemsTable({
  items,
  onItemsChange,
  saveMode,
  onSaveModeChange,
  categories = [],
  subtotal = null,
  taxAmount = null,
  totalAmount = null,
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
      id: Math.random().toString(36).substring(2, 9),
      description: "",
      amount: "",
      categoryId: "",
    };
    onItemsChange([...items, newItem]);
  };

  const handleDeleteItem = (id) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const calculateSum = () => {
    const sum = items.reduce((acc, item) => {
      const val = parseFloat(item.amount);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return sum.toFixed(2);
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const categoryOptions = expenseCategories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const itemsSum = calculateSum();

  return (
    <div className="space-y-4 text-left">
      {/* Selector de Modalidad de Guardado */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-(--headings-color)">
          Modalidad de Registro
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSaveModeChange("single")}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              saveMode === "single"
                ? "bg-(--primary-color)/10 border-(--primary-color) text-(--primary-color) shadow-xs"
                : "border-(--sidebar-border) bg-(--bg-light) text-(--text-color) hover:text-(--headings-color)"
            }`}
          >
            <IconReceipt size={18} />
            <span>Factura Completa (1 Gasto)</span>
          </button>

          <button
            type="button"
            onClick={() => onSaveModeChange("multiple")}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              saveMode === "multiple"
                ? "bg-(--primary-color)/10 border-(--primary-color) text-(--primary-color) shadow-xs"
                : "border-(--sidebar-border) bg-(--bg-light) text-(--text-color) hover:text-(--headings-color)"
            }`}
          >
            <IconListCheck size={18} />
            <span>Desglose por Producto</span>
          </button>
        </div>
      </div>

      {/* Tabla Resumen de Productos */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-(--headings-color)">
            Productos Detectados ({items.length})
          </span>
          <span className="text-xs font-bold text-(--primary-color)">
            Suma: ${itemsSum}
          </span>
        </div>

        {/* Encabezados de columna */}
        {items.length > 0 && (
          <div className="hidden sm:flex gap-2 px-3 text-[11px] font-semibold text-(--text-color)/80 uppercase tracking-wider">
            <span className="flex-1">Descripción del Producto</span>
            <span className="w-32">Monto ($)</span>
            {saveMode === "multiple" && <span className="w-40">Categoría</span>}
            <span className="w-8 text-center"></span>
          </div>
        )}

        <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-2 pr-1 border border-(--sidebar-border) p-2 rounded-xl bg-(--bg-light)/50">
          {items.length === 0 ? (
            <p className="text-xs text-center py-6 text-(--text-color)">
              No se detectaron líneas de producto. Haz clic en "Añadir Producto" para ingresar uno manualmente.
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id || index}
                className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-(--settings-card-bg) p-2.5 rounded-xl border border-(--sidebar-border) shadow-2xs"
              >
                {/* Nombre de Producto */}
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 bg-(--bg-light) border border-(--sidebar-border) rounded-lg text-xs font-medium text-(--headings-color) focus:outline-none focus:border-(--primary-color)"
                />

                {/* Monto */}
                <div className="w-full sm:w-36 relative flex items-center shrink-0">
                  <span className="absolute left-2.5 text-xs font-semibold text-(--text-color)">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={item.amount}
                    onChange={(e) => handleItemChange(item.id, "amount", e.target.value)}
                    className="w-full pl-6 pr-2 py-2 bg-(--bg-light) border border-(--sidebar-border) rounded-lg text-xs font-semibold text-(--headings-color) focus:outline-none focus:border-(--primary-color)"
                  />
                </div>

                {/* Categoría si es Desglose por Producto */}
                {saveMode === "multiple" && (
                  <div className="w-full sm:w-40 shrink-0">
                    <Select
                      value={item.categoryId || ""}
                      onChange={(val) => handleItemChange(item.id, "categoryId", val)}
                      options={categoryOptions}
                      placeholder="Categoría..."
                      btnClassName="py-1.5 pl-3 pr-7 text-xs rounded-lg min-h-[34px]"
                    />
                  </div>
                )}

                {/* Eliminar */}
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer self-end sm:self-center shrink-0"
                  title="Eliminar producto"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Botón para Añadir Producto */}
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full py-2.5 px-3 border border-dashed border-(--primary-color)/50 text-(--primary-color) hover:bg-(--primary-color)/5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <IconPlus size={16} />
          <span>Añadir Producto</span>
        </button>

        {/* Resumen de Desglose Fiscal (Subtotal, IVA, Total) si fue detectado */}
        {(subtotal || taxAmount) && (
          <div className="p-3 bg-(--bg-light) rounded-xl border border-(--sidebar-border) space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-(--headings-color) pb-1 border-b border-(--sidebar-border)/40">
              <IconInfoCircle size={14} className="text-(--primary-color)" />
              <span>Desglose Fiscal Detectado</span>
            </div>
            {subtotal && (
              <div className="flex justify-between text-(--text-color)">
                <span>Subtotal / Base Imponible:</span>
                <span className="font-semibold">${subtotal}</span>
              </div>
            )}
            {taxAmount && (
              <div className="flex justify-between text-(--text-color)">
                <span>IVA / Impuestos:</span>
                <span className="font-semibold">${taxAmount}</span>
              </div>
            )}
            {totalAmount && (
              <div className="flex justify-between font-bold text-(--headings-color) pt-1 border-t border-(--sidebar-border)/40">
                <span>Total Factura:</span>
                <span className="text-(--primary-color)">${totalAmount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
