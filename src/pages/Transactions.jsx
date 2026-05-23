import { TransactionTable } from "../components/TransactionTable";
import { TransactionForm } from "../components/TransactionForm";
import { useState, useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";

export default function Transactions({ user }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
    <div className="container py-4">
      <h1 className="fw-bold mb-4">Mis Transacciones</h1>
      
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-transparent py-3">
              <h5 className="mb-0 fw-bold">Agregar Movimiento</h5>
            </div>
            <div className="card-body">
              <TransactionForm onTransactionAdded={refreshData} user={user} />
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-transparent py-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <h5 className="mb-0 fw-bold">Historial de Movimientos</h5>
                
                {/* Filtro por Categoría */}
                <div className="d-flex align-items-center gap-2">
                  <label htmlFor="catFilter" className="small text-muted text-nowrap">Filtrar por:</label>
                  <select 
                    id="catFilter"
                    className="form-select form-select-sm" 
                    style={{ minWidth: '150px' }}
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
            </div>
            
            <div className="card-body p-0">
              <TransactionTable 
                transactions={transactions} 
                loading={loadingTransactions}
                viewMode={viewMode}
                setViewMode={handleSetViewMode}
              />
            </div>

            {/* Paginación */}
            {!loadingTransactions && totalCount > 0 && (
              <div className="card-footer bg-transparent py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">
                    Mostrando {transactions.length} de {totalCount} resultados
                  </span>
                  
                  {totalPages > 1 && (
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        {/* Botón Anterior */}
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={currentPage === 1}
                          >
                            Anterior
                          </button>
                        </li>

                        {/* Números de Página con Elipsis */}
                        {getPageRange().map((page, i) => (
                          <li 
                            key={i} 
                            className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                          >
                            {page === '...' ? (
                              <span className="page-link text-muted">...</span>
                            ) : (
                              <button 
                                className="page-link" 
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            )}
                          </li>
                        ))}

                        {/* Botón Siguiente */}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Siguiente
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
