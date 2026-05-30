import { useState } from "react";
import iconDictionary from "../utilities/iconDictionary";
import IconPicker from "./IconPicker";

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
    <section className="mb-4">
      <h4 className="mb-3" style={{ color: color || "var(--headings-color)" }}>{title}</h4>
      <div className="list-group">
        {list.map((cat) => {
          const isEditing = editingId === cat.id;
          const IconComponent = iconDictionary[cat.icon] || iconDictionary.IconCoin;
          return (
            <div
              key={cat.id}
              className="list-group-item d-flex align-items-center justify-content-between py-2 px-3 border-0 shadow-sm rounded-3 mb-2"
              style={{ backgroundColor: "var(--settings-card-bg, #ffffff)", border: "var(--card-border)" }}
            >
              <div className="d-flex align-items-center gap-2">
                {isEditing ? (
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ maxWidth: "200px" }}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <IconPicker value={editIcon} onChange={setEditIcon} btnClassName="btn btn-sm btn-outline-secondary" />
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    {IconComponent && <IconComponent size={22} className="text-secondary" />}
                    <span className="fw-medium text-dark-emphasis">{cat.name}</span>
                    <span
                      className="badge rounded-pill bg-light text-muted border ms-2"
                      style={{ fontSize: "0.7rem" }}
                      title={cat.user_id ? "Categoría de usuario" : "Categoría global"}
                    >
                      {cat.user_id ? "Personal" : "Global"}
                    </span>
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center gap-1">
                {isEditing ? (
                  <>
                    <button className="btn btn-sm btn-success px-3" onClick={() => handleSaveEdit(cat)}>
                      Guardar
                    </button>
                    <button className="btn btn-sm btn-secondary px-3" onClick={handleCancelEdit}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    {cat.user_id && onEdit && (
                      <button className="btn btn-sm btn-outline-primary px-3" onClick={() => handleStartEdit(cat)}>
                        Editar
                      </button>
                    )}
                    <button
                      className={`btn btn-sm px-3 ${
                        onLabel === "Recuperar"
                          ? "btn-outline-success"
                          : cat.user_id
                          ? "btn-outline-danger"
                          : "btn-outline-warning"
                      }`}
                      onClick={() => onAction(cat)}
                    >
                      {onLabel ? onLabel : cat.user_id ? "Eliminar" : "Ocultar"}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p className="text-muted fs-6 fst-italic">No hay categorías en esta sección</p>}
    </section>
  );
}
