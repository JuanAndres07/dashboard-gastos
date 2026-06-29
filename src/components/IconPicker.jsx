import { useState } from "react";
import iconDictionary, {
  iconNames,
  iconTranslations,
} from "../utilities/iconDictionary";
import { IconSearch, IconChevronDown } from "@tabler/icons-react";
import { Popover, PopoverButton, PopoverPanel, Portal } from "@headlessui/react";

export default function IconPicker({
  value,
  onChange,
  className = "inline-block",
  btnClassName = "px-4 py-2 bg-(--settings-card-bg) border border-(--sidebar-border) rounded-xl text-(--headings-color) hover:bg-(--sidebar-link-hover-bg) text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 cursor-pointer",
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const SelectedIcon = iconDictionary[value] || iconDictionary.IconCoin;

  const filteredIconNames = iconNames.filter((name) => {
    const translation = iconTranslations[name] || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Popover className={`relative ${className}`}>
      {({ close }) => (
        <>
          <PopoverButton
            type="button"
            className={`${btnClassName} flex items-center gap-2 justify-between min-w-40`}
          >
            <div className="flex items-center gap-2 text-start truncate max-w-45">
              {SelectedIcon && <SelectedIcon size={20} className="shrink-0" />}
              <span className="truncate text-[13px]">
                {value
                  ? iconTranslations[value] || value.replace("Icon", "")
                  : "Icono"}
              </span>
            </div>
            <IconChevronDown
              size={16}
              className="text-(--text-color)/60 shrink-0"
            />
          </PopoverButton>

          <Portal>
            <PopoverPanel
              transition
              anchor={{ to: "bottom start", gap: 4 }}
              className="z-1300 p-3 bg-(--settings-card-bg) rounded-xl shadow-xl w-75 max-w-[calc(100vw-2.5rem)] max-h-87.5 flex flex-col transition duration-150 ease-in-out data-closed:scale-95 data-closed:opacity-0 focus:outline-none"
              style={{
                border: "var(--card-border)",
              }}
            >
              {/* Search bar */}
              <div className="relative mb-3">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-(--text-color)/50">
                  <IconSearch size={16} />
                </span>
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2 bg-(--bg-light)/50 border border-(--sidebar-border) rounded-xl text-(--headings-color) placeholder:text-(--text-color)/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300"
                  placeholder="Buscar icono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Grid of icons */}
              <div
                className="grid grid-cols-5 gap-1 overflow-y-auto pr-1 pb-1"
                style={{
                  maxHeight: "240px",
                }}
              >
                {filteredIconNames.map((name) => {
                  const IconComp = iconDictionary[name];
                  const isSelected = value === name;
                  const titleText =
                    iconTranslations[name] || name.replace("Icon", "");
                  return (
                    <button
                      key={name}
                      type="button"
                      className={`aspect-square p-2 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-(--primary-color) text-white shadow-xs"
                          : "hover:bg-(--sidebar-link-hover-bg) text-(--text-color) hover:text-(--headings-color)"
                      }`}
                      onClick={() => {
                        onChange(name);
                        close();
                        setSearchQuery("");
                      }}
                      title={titleText}
                    >
                      <IconComp
                        size={22}
                        className={isSelected ? "text-white" : "text-current"}
                      />
                    </button>
                  );
                })}
                {filteredIconNames.length === 0 && (
                  <div className="text-center py-6 text-xs text-(--text-color)/60 col-span-5">
                    No se encontraron iconos
                  </div>
                )}
              </div>
            </PopoverPanel>
          </Portal>
        </>
      )}
    </Popover>
  );
}

