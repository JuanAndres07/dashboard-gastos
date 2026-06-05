export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  showingCount,
  loading = false,
}) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading || totalCount === 0) return null;

  const getPageRange = () => {
    const delta = 1;
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }

    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className="mt-6 pt-6 border-t border-(--sidebar-border)/40 flex flex-col sm:flex-row justify-between items-center gap-4">
      <span className="text-xs font-medium text-(--text-color)/85">
        Mostrando{" "}
        <span className="font-semibold text-(--headings-color)">
          {showingCount}
        </span>{" "}
        de{" "}
        <span className="font-semibold text-(--headings-color)">
          {totalCount}
        </span>{" "}
        resultados
      </span>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1.5">
          {/* Botón Anterior */}
          <button
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
              currentPage === 1
                ? "text-(--text-color)/40 cursor-not-allowed opacity-50"
                : "text-(--text-color) hover:bg-(--sidebar-link-hover-bg) hover:text-(--primary-color)"
            }`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          {/* Números de Página con Elipsis */}
          {getPageRange().map((page, i) => (
            <div key={i}>
              {page === "..." ? (
                <span className="px-2.5 py-1.5 text-xs text-(--text-color)/50 font-medium">
                  ...
                </span>
              ) : (
                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    page === currentPage
                      ? "bg-(--primary-color) text-white shadow-[0_4px_10px_rgba(0,82,204,0.2)]"
                      : "text-(--text-color) hover:bg-(--sidebar-link-hover-bg) hover:text-(--primary-color)"
                  }`}
                  onClick={() => onPageChange(page)}
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
                ? "text-(--text-color)/40 cursor-not-allowed opacity-50"
                : "text-(--text-color) hover:bg-(--sidebar-link-hover-bg) hover:text-(--primary-color)"
            }`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </nav>
      )}
    </div>
  );
}
