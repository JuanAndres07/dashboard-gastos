import { formatCurrency } from "../utilities/formatters";
import { iconDictionary } from "../utilities/iconDictionary";
import { IconTrash } from "@tabler/icons-react";
import { supabase } from "../lib/supabase";
import { useState } from "react";

export function TransactionTable({ transactions, loading, viewMode, setViewMode, onTransactionDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este movimiento?")) {
      setDeletingId(id);
      try {
        const { error } = await supabase.from("Transaction").delete().eq("id", id);
        if (error) {
          alert("Error al eliminar el movimiento: " + error.message);
        } else {
          if (onTransactionDeleted) {
            onTransactionDeleted();
          }
        }
      } catch (err) {
        console.error("Error al eliminar transacción:", err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Switcher de Vista (Gastos vs Ingresos) */}
      <div className="flex bg-(--bg-light) p-1 rounded-xl gap-1 w-fit mb-6">
        <button 
          type="button"
          className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
            viewMode === "expense" 
              ? "bg-(--danger-color) text-white shadow-md shadow-danger/10" 
              : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
          }`}
          onClick={() => setViewMode("expense")}
        >
          Gastos
        </button>
        <button 
          type="button"
          className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
            viewMode === "income" 
              ? "bg-(--success-color) text-white shadow-md shadow-success/10" 
              : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
          }`}
          onClick={() => setViewMode("income")}
        >
          Ingresos
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium text-(--text-color)">Cargando movimientos...</span>
        </div>
      ) : transactions.length > 0 ? (
        <>
          {/* Vista Móvil (Tarjetas para pantallas menores a lg) */}
          <div className="block lg:hidden space-y-3.5">
            {transactions.map((t) => {
              const CategoryIcon = iconDictionary[t.Category?.icon] || iconDictionary.IconCoin;
              const isDeleting = deletingId === t.id;
              return (
                <div 
                  key={t.id}
                  className="flex items-center justify-between p-4 bg-(--settings-card-bg) rounded-2xl border border-(--sidebar-border) transition-all duration-300 gap-3"
                  style={{ border: "var(--card-border)" }}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`p-3 rounded-xl shrink-0 ${
                      t.type === "expense" 
                        ? "bg-(--danger-color)/10 text-(--danger-color)" 
                        : "bg-(--success-color)/10 text-(--success-color)"
                    } flex items-center justify-center w-11 h-11`}>
                      <CategoryIcon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-(--headings-color) text-sm break-words whitespace-normal leading-snug">
                        {t.note || <span className="italic text-(--text-color)/40 font-normal">Sin descripción</span>}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-(--text-color) bg-(--bg-light) dark:bg-(--bg-light)/20 px-2 py-0.5 rounded-md">
                          {t.Category?.name || "General"}
                        </span>
                        <span className="text-[10px] font-medium text-(--text-color)/70">
                          {new Date(t.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-bold text-sm leading-none ${
                      t.type === "expense" ? "text-(--danger-color)" : "text-(--success-color)"
                    }`}>
                      {t.type === "expense" ? "-" : "+"}
                      {formatCurrency(t.amount)}
                    </span>
                    
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl text-(--text-color)/40 hover:text-(--danger-color) hover:bg-(--danger-color)/10 transition-all duration-200 cursor-pointer disabled:opacity-50"
                      title="Eliminar movimiento"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vista Escritorio (Tabla para pantallas >= lg) */}
          <div 
            className="hidden lg:block overflow-x-auto rounded-2xl border border-(--sidebar-border)" 
            style={{ border: "var(--card-border)" }}
          >
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-(--bg-light) border-b border-(--sidebar-border)">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-(--headings-color) uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-xs font-bold text-(--headings-color) uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-4 text-xs font-bold text-(--headings-color) uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-[11px] sm:text-xs font-bold text-(--headings-color) uppercase tracking-wider text-right">Monto</th>
                  <th className="px-6 py-4 text-[11px] sm:text-xs font-bold text-(--headings-color) uppercase tracking-wider text-center w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--sidebar-border)/40 bg-(--settings-card-bg)">
                {transactions.map((t) => {
                  const CategoryIcon = iconDictionary[t.Category?.icon] || iconDictionary.IconCoin;
                  const isDeleting = deletingId === t.id;
                  return (
                    <tr 
                      key={t.id}
                      className="hover:bg-(--sidebar-link-hover-bg)/30 transition-all duration-200 ease-in-out"
                    >
                      <td className="px-6 py-4 text-(--text-color) whitespace-nowrap text-xs font-medium">
                        {new Date(t.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-(--headings-color) font-semibold text-sm">
                        {t.note || <span className="italic text-(--text-color)/40 font-normal">Sin descripción</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-(--sidebar-link-hover-bg) text-(--primary-color) border border-(--sidebar-border)/50">
                          <CategoryIcon size={14} className="shrink-0" />
                          {t.Category?.name || "General"}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold text-sm whitespace-nowrap ${
                        t.type === "expense" ? "text-(--danger-color)" : "text-(--success-color)"
                      }`}>
                        {t.type === "expense" ? "-" : "+"}
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-(--text-color)/50 hover:text-(--danger-color) hover:bg-(--danger-color)/10 transition-all duration-200 cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                          title="Eliminar movimiento"
                        >
                          <IconTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {/* Estado Vacío */}
      {transactions.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-(--bg-light)/10 rounded-2xl border border-dashed border-(--sidebar-border)">
          <div className="w-16 h-16 rounded-2xl bg-(--bg-light) dark:bg-(--bg-light)/20 flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105 border border-(--sidebar-border)/50">
            <svg className="w-8 h-8 text-(--text-color)/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-(--headings-color) mb-1">Sin movimientos</h3>
          <p className="text-xs text-(--text-color)/80 max-w-xs leading-relaxed">
            No encontramos transacciones registradas para este periodo, categoría o descripción.
          </p>
        </div>
      )}
    </div>
  );
}
