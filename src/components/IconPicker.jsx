import { useState, useRef, useEffect } from "react";
import iconDictionary, { iconNames, iconTranslations } from "../utilities/iconDictionary";
import { IconSearch, IconChevronDown } from "@tabler/icons-react";

export default function IconPicker({ value, onChange, btnClassName = "btn btn-outline-secondary" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const SelectedIcon = iconDictionary[value] || iconDictionary.IconCoin;

  const filteredIconNames = iconNames.filter((name) => {
    const translation = iconTranslations[name] || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="position-relative d-inline-block" ref={containerRef}>
      <button
        type="button"
        className={`${btnClassName} d-flex align-items-center gap-2`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ minWidth: "160px", justifyContent: "space-between" }}
      >
        <div className="d-flex align-items-center gap-2 text-start text-truncate" style={{ maxWidth: "180px" }}>
          {SelectedIcon && <SelectedIcon size={20} className="flex-shrink-0" />}
          <span className="text-truncate" style={{ fontSize: "0.9rem" }}>
            {value ? (iconTranslations[value] || value.replace("Icon", "")) : "Icono"}
          </span>
        </div>
        <IconChevronDown size={16} className="text-muted flex-shrink-0" />
      </button>

      {isOpen && (
        <div
          className="card shadow-lg position-absolute mt-1 p-2"
          style={{
            zIndex: 1050,
            width: "300px",
            maxHeight: "350px",
            overflow: "hidden",
            left: 0,
            top: "100%",
            backgroundColor: "var(--settings-card-bg, #ffffff)",
            border: "var(--card-border)",
            borderRadius: "12px",
          }}
        >
          {/* Search bar */}
          <div className="input-group input-group-sm mb-2">
            <span className="input-group-text bg-transparent border-end-0">
              <IconSearch size={14} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 shadow-none"
              placeholder="Buscar icono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Grid of icons */}
          <div
            className="d-grid gap-1 overflow-auto pe-1"
            style={{
              gridTemplateColumns: "repeat(5, 1fr)",
              maxHeight: "260px",
              paddingBottom: "4px",
            }}
          >
            {filteredIconNames.map((name) => {
              const IconComp = iconDictionary[name];
              const isSelected = value === name;
              const titleText = iconTranslations[name] || name.replace("Icon", "");
              return (
                <button
                  key={name}
                  type="button"
                  className={`btn p-2 d-flex align-items-center justify-content-center rounded-3 transition-all ${
                    isSelected
                      ? "btn-primary"
                      : "btn-light border-0"
                  }`}
                  style={{
                    aspectRatio: "1",
                    backgroundColor: isSelected ? undefined : "transparent",
                  }}
                  onClick={() => {
                    onChange(name);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  title={titleText}
                >
                  <IconComp size={22} className={isSelected ? "text-white" : "text-secondary"} />
                </button>
              );
            })}
            {filteredIconNames.length === 0 && (
              <div className="text-center py-4 text-muted col-span-5" style={{ gridColumn: "span 5" }}>
                No se encontraron iconos
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
