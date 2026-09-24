import { WALLET_TYPES } from "../../constants/currencies";

export function WalletTypeFilter({ selectedType, onSelectType }) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-(--bg-light) rounded-xl overflow-x-auto w-full sm:w-auto">
      <button
        type="button"
        onClick={() => onSelectType("all")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
          selectedType === "all"
            ? "bg-(--primary-color) text-white shadow-xs"
            : "text-(--text-color) hover:text-(--headings-color)"
        }`}
      >
        Todas
      </button>
      {Object.values(WALLET_TYPES).map((type) => (
        <button
          key={type.id}
          type="button"
          onClick={() => onSelectType(type.id)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            selectedType === type.id
              ? "bg-(--primary-color) text-white shadow-xs"
              : "text-(--text-color) hover:text-(--headings-color)"
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
