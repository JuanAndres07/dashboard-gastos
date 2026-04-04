export default function CategoryList({
  title,
  list,
  onAction,
  onLabel,
  color,
}) {
  return (
    <section>
      <h3 style={{ color: color || "black" }}>{title}</h3>
      <ul>
        {list.map((cat) => (
          <li key={cat.id}>
            {cat.name} {cat.user_id ? "👤" : "🌐"}
            <button onClick={() => onAction(cat)}>
              {onLabel ? onLabel : cat.user_id ? "Eliminar" : "Ocultar"}
            </button>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p>No hay categorías en esta sección</p>}
    </section>
  );
}
