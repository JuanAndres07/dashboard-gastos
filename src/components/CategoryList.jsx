import { useState } from "react";
import iconDictionary from "../utilities/iconDictionary";
import IconPicker from "./IconPicker";
import { IconPencil, IconTrash, IconEyeOff, IconArrowBackUp } from "@tabler/icons-react";

export default function CategoryList({
  title,
  list,
  onAction,
  onEdit,
  onLabel,
  color,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon || "IconCoin");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
  };

  const handleSaveEdit = async (cat) => {
    if (onEdit) {
      const saved = await onEdit(cat, editName, editIcon);
      if (saved) {
        setEditingId(null);
        setEditName("");
        setEditIcon("");
      }
    } else {
      setEditingId(null);
      setEditName("");
      setEditIcon("");
    }
  };

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h4 
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: color || "var(--headings-color)" }}
        >
          {title}
        </h4>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-(--bg-light) text-(--text-color) border border-(--sidebar-border)">
          {list.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-2">
        {list.map((cat) => {
          const isEditing = editingId === cat.id;
          const IconComponent = iconDictionary[cat.icon] || iconDictionary.IconCoin;
          const isPersonal = cat.user_id ? true : (cat.is_global === false);
          return (
            <div
              key={cat.id}
              className={`flex transition-all duration-300 hover:shadow-xs hover:translate-x-0.5 ${
                isEditing
                  ? "flex-col md:flex-row gap-4 items-stretch md:items-center p-4 bg-(--settings-card-bg) rounded-xl"
                  : "flex-row gap-3 items-center justify-between p-4 bg-(--settings-card-bg) rounded-xl"
              }`}
              style={{ border: "var(--card-border)" }}
            >
              <div className={`flex items-center ${isEditing ? "grow" : "gap-3 min-w-0 flex-1"}`}>
                {isEditing ? (
                  <div className="flex flex-col md:flex-row gap-2 w-full">
                    <input
                      type="text"
                      className="w-full md:w-auto md:max-w-45 px-3 py-1.5 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <IconPicker
                      value={editIcon}
                      onChange={setEditIcon}
                      btnClassName="w-full md:w-auto px-3 py-1.5 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-lg text-xs font-semibold hover:bg-(--sidebar-link-hover-bg) transition-all duration-300 cursor-pointer text-left"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-(--sidebar-link-hover-bg) text-(--primary-color) flex items-center justify-center shrink-0">
                      {IconComponent && <IconComponent size={20} />}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="font-semibold text-(--headings-color) text-sm break-all">
                        {cat.name}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-(--bg-light) border border-(--sidebar-border) text-(--text-color) shrink-0"
                        title={isPersonal ? "Categoría de usuario" : "Categoría global"}
                      >
                        {isPersonal ? "Personal" : "Global"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-1 shrink-0 ${isEditing ? "justify-end mt-2 md:mt-0 w-full md:w-auto" : ""}`}>
                {isEditing ? (
                  <>
                    <button 
                      className="flex-1 md:flex-none px-3.5 py-1.5 text-xs font-semibold text-white bg-(--success-color) hover:opacity-90 active:scale-[0.98] rounded-lg transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.15)] text-center" 
                      onClick={() => handleSaveEdit(cat)}
                    >
                      Guardar
                    </button>
                    <button 
                      className="flex-1 md:flex-none px-3.5 py-1.5 text-xs font-semibold text-(--text-color) bg-(--bg-light) border border-(--sidebar-border) hover:bg-(--sidebar-link-hover-bg) hover:text-(--headings-color) active:scale-[0.98] rounded-lg transition-all duration-200 cursor-pointer text-center" 
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    {isPersonal && onEdit && (
                      <button 
                        className="p-1.5 rounded-lg text-(--text-color)/50 hover:text-(--primary-color) hover:bg-(--primary-color)/10 transition-all duration-200 cursor-pointer inline-flex items-center justify-center" 
                        onClick={() => handleStartEdit(cat)}
                        title="Editar"
                      >
                        <IconPencil size={16} />
                      </button>
                    )}
                    <button
                      className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer inline-flex items-center justify-center ${
                        onLabel === "Recuperar"
                          ? "text-(--text-color)/50 hover:text-(--success-color) hover:bg-(--success-color)/10"
                          : isPersonal
                          ? "text-(--text-color)/50 hover:text-(--danger-color) hover:bg-(--danger-color)/10"
                          : "text-(--text-color)/50 hover:text-[#d97706] hover:bg-[#d97706]/10"
                      }`}
                      onClick={() => onAction(cat)}
                      title={onLabel ? onLabel : isPersonal ? "Eliminar" : "Ocultar"}
                    >
                      {onLabel === "Recuperar" ? (
                        <IconArrowBackUp size={16} />
                      ) : isPersonal ? (
                        <IconTrash size={16} />
                      ) : (
                        <IconEyeOff size={16} />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {list.length === 0 && (
        <div className="text-center py-8 px-4 border border-dashed border-(--sidebar-border) rounded-xl text-xs italic text-(--text-color)/60 bg-(--bg-light)/10">
          No hay categorías en esta sección
        </div>
      )}
    </section>
  );
}
