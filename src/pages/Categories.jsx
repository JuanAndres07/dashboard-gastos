import { useState } from "react";
import CategoryList from "../components/CategoryList";
import IconPicker from "../components/IconPicker";
import useManageCategories from "../hooks/useManageCategories";
import {
  IconPlus,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import Modal from "../components/Modal";
import { toast } from "sonner";

export default function Categories({ user }) {
  const {
    categories,
    hiddenCategories,
    addCategory,
    editCategory,
    deleteCategory,
    unhideCategory,
    loading,
  } = useManageCategories(user);

  const [showHidden, setShowHidden] = useState(false);
  const [viewMode, setViewMode] = useState("expense");
  const [newName, setNewName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("IconCoin");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("expense");

  const handleOpenModal = () => {
    setModalType(viewMode);
    setIsModalOpen(true);
  };

  async function handleAddCategory(e) {
    e.preventDefault();
    const result = await addCategory(newName, modalType, selectedIcon);

    if (!result.success) {
      if (result.code === "DUPLICATE_HIDDEN") {
        if (window.confirm(result.message)) {
          const restoreResult = await unhideCategory(result.categoryToRestore);
          if (!restoreResult.success) {
            toast.error(restoreResult.message);
          } else {
            toast.success("Categoría restaurada con éxito");
          }
          setNewName("");
          setSelectedIcon("IconCoin");
          setIsModalOpen(false);
        }
      } else {
        toast.error(result.message);
      }
      return;
    }

    toast.success("Categoría creada con éxito");
    setNewName("");
    setSelectedIcon("IconCoin");
    setIsModalOpen(false);
  }

  async function onEditCategory(category, name, icon) {
    const result = await editCategory(category, name, viewMode, icon);
    if (!result.success) {
      toast.error(result.message);
      return false;
    }
    toast.success("Categoría actualizada con éxito");
    return true;
  }

  async function onDeleteCategory(category_id, is_global) {
    const actionLabel = is_global ? "ocultar" : "eliminar";
    if (
      !window.confirm(`¿Estás seguro que deseas ${actionLabel} esta categoría?`)
    )
      return;

    const result = await deleteCategory(category_id, is_global);
    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success(is_global ? "Categoría oculta con éxito" : "Categoría eliminada con éxito");
    }
  }

  async function onUnhideCategory(category) {
    if (!window.confirm("¿Estás seguro que deseas mostrar esta categoría?"))
      return;

    const result = await unhideCategory(category);
    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success("Categoría recuperada con éxito");
    }
  }

  return (
    <div className="w-full space-y-6 text-left">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">
            Gestionar Categorías
          </h1>
          <p className="text-sm text-(--text-color)/85 mt-1">
            Organiza tus gastos e ingresos creando categorías personalizadas.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-(--primary-color) text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.99] shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] cursor-pointer text-sm shrink-0"
        >
          <IconPlus size={18} className="shrink-0" />
          <span>Nueva Categoría</span>
        </button>
      </header>

      <div
        className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
        style={{ border: "var(--card-border)" }}
      >
        {/* Selector de modo (Gastos vs Ingresos) */}
        <div className="flex bg-(--bg-light) p-1 rounded-xl gap-1 w-fit mb-6">
          <button
            type="button"
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
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
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
              viewMode === "income"
                ? "bg-(--success-color) text-white shadow-md shadow-success/10"
                : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
            }`}
            onClick={() => setViewMode("income")}
          >
            Ingresos
          </button>
        </div>

        {/* Listado y Papelera */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
            <span className="text-sm font-medium text-(--text-color)">
              Cargando categorías...
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <CategoryList
                title={
                  viewMode === "expense"
                    ? "Categorías de Gastos"
                    : "Categorías de Ingresos"
                }
                list={categories.filter((cat) => cat.type === viewMode)}
                onAction={(cat) => onDeleteCategory(cat.id, !cat.user_id)}
                onEdit={onEditCategory}
                color={
                  viewMode === "expense"
                    ? "var(--danger-color)"
                    : "var(--success-color)"
                }
              />
            </div>

            <div className="border-t border-(--sidebar-border)/60 my-6"></div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowHidden(!showHidden)}
                className="flex items-center gap-2 px-4 py-2 bg-(--bg-light)/60 hover:bg-(--sidebar-link-hover-bg) text-(--text-color) hover:text-(--headings-color) border border-(--sidebar-border) rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer"
              >
                <IconTrash size={16} />
                <span>
                  {showHidden ? "Ocultar papelera" : "Mostrar papelera"}
                </span>
                {showHidden ? (
                  <IconChevronUp size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )}
              </button>

              {showHidden && (
                <div className="p-4 bg-(--bg-light)/10 border border-dashed border-(--sidebar-border) rounded-2xl transition-all duration-300">
                  <CategoryList
                    title={
                      viewMode === "expense"
                        ? "Gastos Ocultos"
                        : "Ingresos Ocultos"
                    }
                    list={hiddenCategories.filter(
                      (cat) => cat.type === viewMode,
                    )}
                    onAction={(cat) => onUnhideCategory(cat)}
                    onLabel="Recuperar"
                    color="var(--text-color)"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal para Agregar Categoría */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Categoría"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          {/* Selector de Tipo */}
          <div>
            <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5">
              Tipo de Categoría
            </label>
            <div className="flex bg-(--bg-light) p-1 rounded-xl gap-1 w-full">
              <button
                type="button"
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
                  modalType === "expense"
                    ? "bg-(--danger-color) text-white shadow-md shadow-danger/10"
                    : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
                }`}
                onClick={() => setModalType("expense")}
              >
                Gasto
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
                  modalType === "income"
                    ? "bg-(--success-color) text-white shadow-md shadow-success/10"
                    : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
                }`}
                onClick={() => setModalType("income")}
              >
                Ingreso
              </button>
            </div>
          </div>

          {/* Nombre de la categoría */}
          <div>
            <label
              htmlFor="catName"
              className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5"
            >
              Nombre
            </label>
            <input
              id="catName"
              type="text"
              className="w-full px-4 py-2.5 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder:text-(--text-color)/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
              placeholder={`Ej. ${modalType === "expense" ? "Supermercado, Alquiler" : "Salario, Freelance"}...`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          {/* Selector de Icono */}
          <div>
            <label className="block text-xs font-semibold text-(--text-color) uppercase tracking-wider mb-1.5">
              Icono
            </label>
            <IconPicker
              value={selectedIcon}
              onChange={setSelectedIcon}
              btnClassName="w-full px-4 py-2.5 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-xl text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) text-(--text-color) font-semibold rounded-xl text-sm transition-all duration-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-(--primary-color) text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-[0_4px_12px_rgba(0,82,204,0.15)]"
            >
              Crear Categoría
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
