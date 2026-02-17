"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CURRENCIES } from "@/lib/currencies"

type CurrencySelectProps = {
  label: string
  value: string
  onValueChange: (value: string) => void
  excludeCode?: string
  disabled?: boolean
}

export function CurrencySelect({
  label,
  value,
  onValueChange,
  excludeCode,
  disabled,
}: CurrencySelectProps) {
  const filteredCurrencies = excludeCode
    ? CURRENCIES.filter((c) => c.code !== excludeCode)
    : CURRENCIES

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full h-12 bg-card border-border text-foreground">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {filteredCurrencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <span className="flex items-center gap-2">
                <span className="text-base">{currency.flag}</span>
                <span className="font-medium">{currency.code}</span>
                <span className="text-muted-foreground text-xs">
                  {currency.name}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
