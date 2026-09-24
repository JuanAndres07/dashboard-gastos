/**
 * Catálogo centralizado de Monedas y Tipos de Carteras (Single Source of Truth)
 */

export const CURRENCIES = {
  USD: {
    code: "USD",
    name: "Dólar Estadounidense",
    symbol: "$",
    prefix: "$",
    suffix: "",
    decimals: 2,
    flag: "🇺🇸",
  },
  VES: {
    code: "VES",
    name: "Bolívar Venezolano",
    symbol: "Bs.",
    prefix: "Bs. ",
    suffix: "",
    decimals: 2,
    flag: "🇻🇪",
  },
  USDT: {
    code: "USDT",
    name: "Tether (USDT)",
    symbol: "USDT",
    prefix: "",
    suffix: " USDT",
    decimals: 2,
    flag: "🟢",
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    prefix: "€",
    suffix: "",
    decimals: 2,
    flag: "🇪🇺",
  },
  BTC: {
    code: "BTC",
    name: "Bitcoin",
    symbol: "BTC",
    prefix: "",
    suffix: " BTC",
    decimals: 6,
    flag: "₿",
  },
};

export const WALLET_TYPES = {
  bank: {
    id: "bank",
    label: "Banco Nacional",
    description: "Cuentas bancarias en moneda local o custodia",
    defaultCurrency: "VES",
    defaultIcon: "IconBuildingBank",
    defaultColor: "#0284c7", // Azul
  },
  digital_wallet: {
    id: "digital_wallet",
    label: "Billetera Digital",
    description: "Zinli, PayPal, Zelle, Wally, etc.",
    defaultCurrency: "USD",
    defaultIcon: "IconCreditCard",
    defaultColor: "#10b981", // Esmeralda
  },
  crypto: {
    id: "crypto",
    label: "Exchange / Cripto",
    description: "Binance, Bybit, Metamask, etc.",
    defaultCurrency: "USDT",
    defaultIcon: "IconCurrencyBitcoin",
    defaultColor: "#f59e0b", // Ámbar
  },
  cash: {
    id: "cash",
    label: "Efectivo",
    description: "Dinero físico en mano",
    defaultCurrency: "USD",
    defaultIcon: "IconCash",
    defaultColor: "#8b5cf6", // Morado
  },
};

export const DEFAULT_WALLET_CURRENCY = "USD";
