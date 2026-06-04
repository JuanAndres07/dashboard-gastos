import { TransactionTable } from "../components/TransactionTable";
import { TransactionForm } from "../components/TransactionForm";
import { useState, useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";

export default function Transactions({ user }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 20;

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Hook para transacciones
  const { transactions, loading: loadingTransactions, viewMode, setViewMode, totalCount } = useTransactions({
    user,
    trigger: refreshTrigger,
    categoryId: selectedCategory || null,
    page: currentPage,
    pageSize: pageSize,
  });

  // Hook para categorías
  const { categories, loading: loadingCategories } = useCategories(user);

  // Filtrar categorías por el tipo actual (gasto/ingreso)
  const filteredCategories = categories.filter(cat => cat.type === viewMode);

  // Reiniciar página si cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, viewMode]);

  // Reiniciar categoría si cambia el tipo
  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    setSelectedCategory("");
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Función para calcular qué números de página mostrar
  const getPageRange = () => {
    const delta = 1; // Páginas a mostrar alrededor de la actual
    const range = [];
    
    // Rango central
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Elipsis izquierda
    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    
    // Elipsis derecha
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    // Siempre incluir primera y última
    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className="w-full space-y-6 text-left">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">Mis Transacciones</h1>
          <p className="text-sm text-(--text-color)/85 mt-1">Registra y administra todos tus ingresos y egresos de forma segura.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-(--primary-color) text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] cursor-pointer shrink-0"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Movimiento</span>
        </button>
      </header>
      
      <div 
        className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
        style={{ border: 'var(--card-border)' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-(--headings-color)">Historial de Movimientos</h2>
          
          {/* Filtro por Categoría */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="catFilter" className="text-xs font-semibold text-(--text-color) whitespace-nowrap uppercase tracking-wider">Filtrar por:</label>
            <select 
              id="catFilter"
              className="w-full sm:w-48 px-3.5 py-2 bg-(--bg-light) border border-(--sidebar-border) rounded-xl text-(--text-color) text-xs font-medium focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="w-full">
          <TransactionTable 
            transactions={transactions} 
            loading={loadingTransactions}
            viewMode={viewMode}
            setViewMode={handleSetViewMode}
          />
        </div>

        {/* Paginación */}
        {!loadingTransactions && totalCount > 0 && (
          <div className="mt-6 pt-6 border-t border-(--sidebar-border)/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs font-medium text-(--text-color)/85">
              Mostrando <span className="font-semibold text-(--headings-color)">{transactions.length}</span> de <span className="font-semibold text-(--headings-color)">{totalCount}</span> resultados
            </span>
            
            {totalPages > 1 && (
              <nav className="flex items-center gap-1.5">
                {/* Botón Anterior */}
                <button 
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                    currentPage === 1 
                      ? 'text-(--text-color)/40 cursor-not-allowed opacity-50' 
                      : 'text-(--text-color) hover:bg-(--sidebar-link-hover-bg) hover:text-(--primary-color)'
                  }`}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>

                {/* Números de Página con Elipsis */}
                {getPageRange().map((page, i) => (
                  <div key={i}>
                    {page === '...' ? (
                      <span className="px-2.5 py-1.5 text-xs text-(--text-color)/50 font-medium">...</span>
                    ) : (
                      <button 
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                          page === currentPage 
                            ? 'bg-(--primary-color) text-white shadow-[0_4px_10px_rgba(0,82,204,0.2)]' 
                            : 'text-(--text-color) hover:bg-(--sidebar-link-hover-bg) hover:text-(--primary-color)'
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )}
                  </div>
                ))}

                {/* Botón Siguiente */}
                <button 
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                    currentPage === totalPages 
                      ? 'text-(--text-color)/40 cursor-not-allowed opacity-50' 
                      : 'text-(--text-color) hover:bg-(--sidebar-link-hover-bg) hover:text-(--primary-color)'
                  }`}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </nav>
            )}
          </div>
        )}
      </div>

      {/* Modal para Agregar Movimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop difuminado */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Tarjeta del Modal */}
          <div 
            className="relative w-full max-w-md bg-(--settings-card-bg) rounded-2xl p-6 shadow-2xl transition-all duration-300 ease-in-out transform scale-100"
            style={{ border: 'var(--card-border)' }}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-(--headings-color)">Registrar Movimiento</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-(--text-color) hover:bg-(--sidebar-link-hover-bg) hover:text-(--headings-color) transition-all duration-200 cursor-pointer"
                aria-label="Cerrar modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <TransactionForm 
              onTransactionAdded={() => {
                refreshData();
                setIsModalOpen(false);
              }} 
              user={user} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
