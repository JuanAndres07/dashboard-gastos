/**
 * Asignador heurístico de categorías basado en palabras clave comunes encontradas en recibos y facturas.
 */

const KEYWORD_MAPPINGS = [
  // Alimentación y Supermercado
  {
    categoryKeywords: ["alimento", "comida", "supermercado", "mercado", "viveres", "abarrotes", "restaurante"],
    itemKeywords: [
      "leche", "queso", "pan", "harina", "arroz", "pasta", "aceite", "azucar", "sal",
      "carne", "pollo", "pescado", "res", "cerdo", "huevo", "huevos", "atun", "sardina",
      "tomate", "cebolla", "papa", "platano", "fruta", "verdura", "manzana", "platano",
      "galleta", "snack", "cafe", "te", "jugo", "refresco", "coca", "pepsi", "agua",
      "mantequilla", "mayonesa", "salsa", "jamon", "embutido", "yogurt", "cereal",
      "pizza", "hamburguesa", "combo", "almuerzo", "desayuno", "cena", "postre"
    ]
  },
  // Hogar y Limpieza
  {
    categoryKeywords: ["hogar", "casa", "limpieza", "mantenimiento", "ferreteria"],
    itemKeywords: [
      "jabon", "detergente", "cloro", "lavaplatos", "suavizante", "desinfectante",
      "papel higienico", "servilleta", "toalla", "esponja", "bolsa", "escoba", "colector",
      "bombillo", "cable", "pila", "bateria", "pintura", "tornillo", "herramienta"
    ]
  },
  // Salud y Cuidado Personal
  {
    categoryKeywords: ["salud", "farmacia", "medicina", "cuidado personal", "higiene"],
    itemKeywords: [
      "farmacia", "medicina", "pastilla", "jarabe", "analgesico", "ibuprofeno", "paracetamol",
      "acetaminofen", "vitamina", "alcohol", "gasa", "curita", "venda", "inyeccion",
      "shampoo", "champu", "acondicionador", "desodorante", "crema", "colgate", "dental",
      "cepillo", "afeitadora", "pañal", "toalla sanitaria"
    ]
  },
  // Transporte y Vehículos
  {
    categoryKeywords: ["transporte", "vehiculo", "gasolina", "combustible", "auto", "carro"],
    itemKeywords: [
      "gasolina", "combustible", "diesel", "lubricante", "aceite motor", "estacionamiento",
      "parqueadero", "peaje", "uber", "taxi", "pasaje", "boleto", "caucho", "repuesto"
    ]
  },
  // Servicios y Facturas
  {
    categoryKeywords: ["servicios", "facturas", "luz", "agua", "internet", "telefonia"],
    itemKeywords: [
      "electricidad", "cantv", "inter", "netuno", "movistar", "digitel", "movilnet",
      "gas", "recarga", "saldo", "mensualidad", "abono"
    ]
  },
  // Ropa y Accesorios
  {
    categoryKeywords: ["ropa", "vestimenta", "calzado", "moda", "accesorios"],
    itemKeywords: [
      "camisa", "franela", "pantalon", "jean", "short", "vestido", "falda", "zapato",
      "calzado", "sandalia", "medias", "gorra", "bolso", "correa"
    ]
  },
  // Entretenimiento y Ocio
  {
    categoryKeywords: ["entretenimiento", "ocio", "diversion", "salidas"],
    itemKeywords: [
      "cine", "pelicula", "entrada", "concierto", "juego", "videojuego", "suscripcion",
      "licor", "cerveza", "vino", "ron", "whisky"
    ]
  }
];

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Sugiere una categoría apropiada para una descripción de producto según la lista de categorías del usuario.
 * @param {string} itemDescription - Nombre o descripción del producto detectado
 * @param {Array} userCategories - Lista de categorías del usuario (de tipo 'expense')
 * @returns {string} - ID de la categoría coincidente o cadena vacía si no hay coincidencia
 */
export function suggestCategoryForItem(itemDescription, userCategories = []) {
  if (!itemDescription || !userCategories.length) return "";

  const normDescription = normalize(itemDescription);
  const expenseCategories = userCategories.filter((c) => c.type === "expense");

  // 1. Intentar coincidencia con los grupos de palabras clave
  for (const group of KEYWORD_MAPPINGS) {
    const matchesItemKeyword = group.itemKeywords.some((keyword) =>
      normDescription.includes(normalize(keyword))
    );

    if (matchesItemKeyword) {
      // Buscar si el usuario tiene alguna categoría que coincida con este grupo
      const matchedCat = expenseCategories.find((cat) => {
        const normCatName = normalize(cat.name);
        return group.categoryKeywords.some((catKeyword) =>
          normCatName.includes(normalize(catKeyword))
        );
      });

      if (matchedCat) {
        return matchedCat.id;
      }
    }
  }

  // 2. Intentar coincidencia directa por nombre de categoría dentro de la descripción
  const directMatch = expenseCategories.find((cat) => {
    const normCatName = normalize(cat.name);
    return normDescription.includes(normCatName) || normCatName.includes(normDescription);
  });

  return directMatch ? directMatch.id : "";
}

/**
 * Aplica sugerencias de categorías a una lista de items que aún no tienen categoría asignada.
 * @param {Array} items
 * @param {Array} categories
 * @returns {Array}
 */
export function autoAssignCategories(items = [], categories = []) {
  return items.map((item) => {
    if (item.categoryId) return item;
    const suggestedId = suggestCategoryForItem(item.description, categories);
    return suggestedId ? { ...item, categoryId: suggestedId } : item;
  });
}
