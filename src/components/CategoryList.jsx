import { useState } from "react";

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

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (cat) => {
    if (onEdit) {
      const saved = await onEdit(cat, editName);
      if (saved) {
        setEditingId(null);
        setEditName("");
      }
    } else {
      setEditingId(null);
      setEditName("");
    }
  };

  return (
    <section>
      <h3 style={{ color: color || "black" }}>{title}</h3>
      <ul>
        {list.map((cat) => {
          const isEditing = editingId === cat.id;
          return (
            <li key={cat.id}>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
              ) : (
                <span>
                  {cat.name} {cat.user_id ? "👤" : "🌐"}
                </span>
              )}

              {isEditing ? (
                <>
                  <button onClick={() => handleSaveEdit(cat)}>Guardar</button>
                  <button onClick={handleCancelEdit}>Cancelar</button>
                </>
              ) : (
                <>
                  <button onClick={() => onAction(cat)}>
                    {onLabel ? onLabel : cat.user_id ? "Eliminar" : "Ocultar"}
                  </button>
                  {cat.user_id && onEdit && (
                    <button onClick={() => handleStartEdit(cat)}>Editar</button>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
      {list.length === 0 && <p>No hay categorías en esta sección</p>}
    </section>
  );
}
