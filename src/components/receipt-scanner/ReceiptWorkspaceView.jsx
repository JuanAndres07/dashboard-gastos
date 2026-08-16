import { ReceiptImageViewer } from "./ReceiptImageViewer";
import { ReceiptItemsTable } from "./ReceiptItemsTable";
import DateInput from "../DateInput";
import { SAVE_MODES } from "../../utilities/scanConstants";
import {
  IconCheck,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";

export function ReceiptWorkspaceView({
  imageSrc,
  parsedData,
  errorText,
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
  displayTotal,
  isSaving,
  onResetImage,
  onCancel,
  onSaveToDatabase,
}) {
  return (
    <div className="space-y-4">
      {errorText && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-2xl text-xs flex items-center gap-2.5">
          <IconAlertCircle size={18} className="shrink-0 text-amber-500" />
          <span>{errorText}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Visor Interactivo de la Imagen del Ticket */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <ReceiptImageViewer
            imageSrc={imageSrc}
            onResetImage={onResetImage}
            detectedStore={customDescription || parsedData?.description}
            totalUSD={parsedData?.totalUSD}
            totalVES={parsedData?.totalVES}
          />
        </div>

        {/* Columna Derecha: Formulario del Gasto y Tabla de Productos */}
        <div className="lg:col-span-7 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-2xl p-5 shadow-xs space-y-5">
          {/* Información General del Gasto */}
          <div className="space-y-3 pb-4 border-b border-(--sidebar-border)">
            <h3 className="text-sm font-bold text-(--headings-color)">
              Datos Generales de la Compra
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-(--text-color) block mb-1">
                  Comercio / Descripción
                </label>
                <input
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Ej. Supermercado El Trigal, Farmatodo..."
                  className="w-full h-10.5 px-3.5 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-xs font-semibold text-(--headings-color) focus:outline-none focus:border-(--primary-color) transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-(--text-color) block mb-1">
                  Fecha del Comprobante
                </label>
                <DateInput
                  value={customDate}
                  onChange={setCustomDate}
                  className="w-full"
                  inputClassName="h-10.5 py-0 text-xs font-semibold bg-(--bg-light)"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Productos y Modalidad */}
          <ReceiptItemsTable
            items={scannedItems}
            onItemsChange={setScannedItems}
            saveMode={saveMode}
            onSaveModeChange={setSaveMode}
            categories={categories}
            singleCategoryId={singleCategoryId}
            onSingleCategoryIdChange={setSingleCategoryId}
          />

          {/* Barra de Acciones de Guardado */}
          <div className="pt-4 border-t border-(--sidebar-border) flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left w-full sm:w-auto">
              <div className="text-[11px] text-(--text-color)">
                Total a Registrar:
              </div>
              <div className="text-xl font-extrabold text-(--headings-color)">
                ${displayTotal}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 sm:flex-none py-2.5 px-4 bg-(--bg-light) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-xs transition-all text-center cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={onSaveToDatabase}
                disabled={isSaving}
                className="flex-1 sm:flex-none py-2.5 px-6 bg-(--primary-color) hover:opacity-90 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    <span>Guardando Gasto...</span>
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    <span>
                      {saveMode === SAVE_MODES.MULTIPLE
                        ? `Guardar ${scannedItems.length} Gastos`
                        : "Guardar Gasto"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
