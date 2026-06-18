import { TransactionTable } from "../components/TransactionTable";
import { TransactionForm } from "../components/TransactionForm";
import { useState, useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { Pagination } from "../components/Pagination";
import Modal from "../components/Modal";
import Select from "../components/Select";
import DateInput from "../components/DateInput";

export default function Transactions({ user }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const pageSize = 20;

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Debounce para el buscador por texto
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Hook para transacciones
  const {
    transactions,
    loading: loadingTransactions,
    viewMode,
    setViewMode,
    totalCount,
  } = useTransactions({
    user,
    trigger: refreshTrigger,
    categoryId: selectedCategory || null,
    page: currentPage,
    pageSize: pageSize,
    startDate,
    endDate,
    search: debouncedSearch,
  });

  // Hook para categorías
  const { categories, loading: loadingCategories } = useCategories(user);

  // Filtrar categorías por el tipo actual (gasto/ingreso)
  const filteredCategories = categories.filter((cat) => cat.type === viewMode);

  // Reiniciar página si cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, viewMode, startDate, endDate, debouncedSearch]);

  // Reiniciar categoría si cambia el tipo
  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    setSelectedCategory("");
  };

  return (
    <div className="w-full space-y-6 text-left">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">
            Mis Transacciones
          </h1>
          <p className="text-sm text-(--text-color)/85 mt-1">
            Registra y administra todos tus ingresos y egresos de forma segura.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-(--primary-color) text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] cursor-pointer shrink-0"
        >
          <IconPlus size={18} className="shrink-0" />
          <span>Nuevo Movimiento</span>
        </button>
      </header>

      <div
        className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
        style={{ border: "var(--card-border)" }}
      >
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-(--headings-color)">
              Historial de Movimientos
            </h2>
          </div>

          {/* Barra de Filtros Dedicada */}
          <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-4">
            {/* Buscador */}
            <div className="relative grow md:grow-0 min-w-0 md:min-w-70 w-full md:w-auto">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-(--text-color)/50">
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                placeholder="Buscar por descripción..."
                className="w-full pl-9 pr-4 py-2 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder:text-(--text-color)/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro de Categorías */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <label
                htmlFor="catFilter"
                className="text-xs font-semibold text-(--text-color) whitespace-nowrap uppercase tracking-wider"
              >
                Categoría:
              </label>
              <Select
                id="catFilter"
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { value: "", label: "Todas" },
                  ...filteredCategories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  })),
                ]}
                btnClassName="!py-2 !text-xs min-w-36"
                className="w-full sm:w-auto"
              />
            </div>

            {/* Filtro de Fechas */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 grow sm:grow-0 w-full sm:w-auto">
              <label className="text-xs font-semibold text-(--text-color) whitespace-nowrap uppercase tracking-wider">
                Rango:
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 w-full sm:w-auto">
                  <DateInput
                    aria-label="Fecha de inicio"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    inputClassName="!py-2 !text-xs w-full"
                    className="w-full sm:w-36"
                  />
                  <span className="text-xs text-(--text-color)/50 font-medium shrink-0 text-center sm:text-left">
                    a
                  </span>
                  <DateInput
                    aria-label="Fecha de fin"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    inputClassName="!py-2 !text-xs w-full"
                    className="w-full sm:w-36"
                  />
              </div>
            </div>

            {/* Botón Limpiar Filtros */}
            {(selectedCategory || startDate || endDate || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setStartDate("");
                  setEndDate("");
                  setSearchTerm("");
                }}
                className="px-3.5 py-2 text-xs font-semibold text-[#e11d48] dark:text-[#f87171] bg-[#fff1f2] dark:bg-[#ef4444]/10 hover:bg-[#ffe4e6] dark:hover:bg-[#ef4444]/20 rounded-xl transition-all duration-300 cursor-pointer shrink-0 w-full sm:w-auto sm:ml-auto text-center"
                title="Limpiar todos los filtros"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        <div className="w-full">
          <TransactionTable
            transactions={transactions}
            loading={loadingTransactions}
            viewMode={viewMode}
            setViewMode={handleSetViewMode}
            onTransactionDeleted={refreshData}
            onEditTransaction={(t) => {
              setEditingTransaction(t);
              setIsModalOpen(true);
            }}
          />
        </div>

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          showingCount={transactions.length}
          loading={loadingTransactions}
        />
      </div>

      {/* Modal para Agregar/Editar Movimiento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? "Editar Movimiento" : "Registrar Movimiento"}
      >
        <TransactionForm
          transactionToEdit={editingTransaction}
          onTransactionAdded={() => {
            refreshData();
            setIsModalOpen(false);
          }}
          onTransactionUpdated={() => {
            refreshData();
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          user={user}
        />
      </Modal>
    </div>
  );
}
