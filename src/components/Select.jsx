import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Portal,
} from "@headlessui/react";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  className = "",
  btnClassName = "",
  disabled = false,
}) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={`relative ${className}`}>
        <ListboxButton
          className={`relative w-full cursor-pointer rounded-xl bg-(--settings-card-bg) border border-(--sidebar-border) py-3 pl-4 pr-10 text-left text-sm text-(--headings-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${btnClassName}`}
          style={{ border: "var(--card-border)" }}
        >
          <span className="block break-all whitespace-normal font-medium pr-2">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <IconChevronDown
              className="h-4 w-4 text-(--text-color)/55"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>

        <Portal>
          <ListboxOptions
            transition
            anchor={{ to: "bottom start", gap: 4 }}
            className="z-50 max-h-60 min-w-(--button-width) w-max max-w-70 overflow-y-auto overflow-x-hidden rounded-xl bg-(--settings-card-bg) py-1.5 text-sm shadow-xl border border-(--sidebar-border) focus:outline-none transition duration-150 ease-in-out data-closed:scale-95 data-closed:opacity-0"
            style={{ border: "var(--card-border)" }}
          >
            {options.length === 0 ? (
              <div className="py-2.5 px-4 text-xs text-(--text-color)/50 font-medium">
                No hay opciones disponibles
              </div>
            ) : (
              options.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="group relative cursor-pointer select-none py-2.5 px-4 text-(--text-color) hover:bg-(--sidebar-link-hover-bg) hover:text-(--headings-color) transition-all duration-150 data-disabled:opacity-50 data-disabled:cursor-not-allowed data-selected:font-bold data-selected:text-(--headings-color)"
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`block break-all whitespace-normal ${selected ? "font-bold text-(--headings-color)" : "font-normal"}`}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <IconCheck
                          className="h-4 w-4 text-(--primary-color) shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  )}
                </ListboxOption>
              ))
            )}
          </ListboxOptions>
        </Portal>
      </div>
    </Listbox>
  );
}
