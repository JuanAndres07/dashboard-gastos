import Select from "../Select";
import { formatCurrency } from "../../utilities/formatters";

export function WalletSelector({
  wallets = [],
  value,
  onChange,
  showAllOption = false,
  allLabel = "Todas las carteras",
  disabled = false,
  placeholder = "Selecciona una cartera",
  className = "",
  btnClassName = "",
}) {
  const options = [
    ...(showAllOption ? [{ value: "", label: allLabel }] : []),
    ...wallets.map((w) => ({
      value: w.id,
      label: `${w.name} (${formatCurrency(w.balance, w.currency)})`,
    })),
  ];

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      btnClassName={btnClassName}
    />
  );
}

export default WalletSelector;
