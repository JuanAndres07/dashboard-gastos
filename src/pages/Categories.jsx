import { useState } from "react";
import CategoryList from "../components/CategoryList";
import IconPicker from "../components/IconPicker";
import useManageCategories from "../hooks/useManageCategories";

export default function Categories({ user }) {
  const {
    categories,
    hiddenCategories,
    addCategory,
    editCategory,
    deleteCategory,
    unhideCategory,
  } = useManageCategories(user);

  const [showHidden, setShowHidden] = useState(false);
  const [viewMode, setViewMode] = useState("expense");
  const [newName, setNewName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("IconCoin");

  async function handleAddCategory(e) {
    e.preventDefault();
    const result = await addCategory(newName, viewMode, selectedIcon);

    if (!result.success) {
      if (result.code === "DUPLICATE_HIDDEN") {
        if (window.confirm(result.message)) {
          const restoreResult = await unhideCategory(result.categoryToRestore);
          if (!restoreResult.success) alert(restoreResult.message);
          setNewName("");
          setSelectedIcon("IconCoin");
        }
      } else {
        alert(result.message);
      }
      return;
    }

    setNewName("");
    setSelectedIcon("IconCoin");
  }

  async function onEditCategory(category, name, icon) {
    const result = await editCategory(category, name, viewMode, icon);
    if (!result.success) {
      alert(result.message);
      return false;
    }
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
      alert(result.message);
    }
  }

  async function onUnhideCategory(category) {
    if (!window.confirm("¿Estás seguro que deseas mostrar esta categoría?"))
      return;

    const result = await unhideCategory(category);
    if (!result.success) {
      alert(result.message);
    }
  }

  return (
    <div>
      <h1>Gestionar categorías</h1>

      <div>
        <button onClick={() => setViewMode("expense")}>
          Ver categorías de Gastos
        </button>
        <button onClick={() => setViewMode("income")}>
          Ver categorías de Ingresos
        </button>
      </div>

      <form onSubmit={handleAddCategory} className="d-flex align-items-center gap-2 my-3">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "300px" }}
          placeholder={`Nombre de la categoría de ${viewMode}`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <IconPicker value={selectedIcon} onChange={setSelectedIcon} />
        <button type="submit" className="btn btn-primary">
          Agregar
        </button>
      </form>

      <hr />

      <h3>Tus categorías</h3>

      <CategoryList
        title={viewMode === "expense" ? "Gastos" : "Ingresos"}
        list={categories.filter((cat) => cat.type === viewMode)}
        onAction={(cat) => onDeleteCategory(cat.id, !cat.user_id)}
        onEdit={onEditCategory}
        color={viewMode === "expense" ? "red" : "green"}
      />

      <div>
        <button onClick={() => setShowHidden(!showHidden)}>
          {showHidden ? "🔼 Ocultar papelera" : "🔽 Mostrar papelera"}
        </button>

        {showHidden && (
          <CategoryList
            title={
              viewMode === "expense" ? "Gastos ocultos" : "Ingresos ocultos"
            }
            list={hiddenCategories.filter((cat) => cat.type === viewMode)}
            onAction={(cat) => onUnhideCategory(cat)}
            onLabel="Recuperar"
            color="gray"
          />
        )}
      </div>
    </div>
  );
}

