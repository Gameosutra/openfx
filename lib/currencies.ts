import type { Currency } from "./types"

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "US" },
  { code: "EUR", name: "Euro", symbol: "\u20AC", flag: "EU" },
  { code: "GBP", name: "British Pound", symbol: "\u00A3", flag: "GB" },
  { code: "JPY", name: "Japanese Yen", symbol: "\u00A5", flag: "JP" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "CA" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "AU" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "CH" },
  { code: "INR", name: "Indian Rupee", symbol: "\u20B9", flag: "IN" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "SG" },
  { code: "NGN", name: "Nigerian Naira", symbol: "\u20A6", flag: "NG" },
]

export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code)
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode)
  if (!currency) return amount.toFixed(2)

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
