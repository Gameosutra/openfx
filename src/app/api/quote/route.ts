import { NextResponse } from "next/server"
import type { QuoteRequest, QuoteResponse } from "@/lib/types"
import { QUOTE_EXPIRY_MS } from "@/lib/constants"

const FX_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  INR: 83.12,
  SGD: 1.34,
  NGN: 1550.0,
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  await delay(600 + Math.random() * 800)

  const body = (await request.json()) as QuoteRequest
  const { sourceCurrency, destinationCurrency, amount } = body

  const sourceRate = FX_RATES[sourceCurrency]
  const destRate = FX_RATES[destinationCurrency]

  if (!sourceRate || !destRate) {
    return NextResponse.json(
      { error: "Unsupported currency pair" },
      { status: 400 }
    )
  }

  const fxRate = destRate / sourceRate
  const fee = Math.max(amount * 0.005, 1.5)
  const totalPayable = amount + fee
  const destinationAmount = amount * fxRate

  const response: QuoteResponse = {
    id: generateId(),
    sourceCurrency,
    destinationCurrency,
    sourceAmount: amount,
    destinationAmount: Number(destinationAmount.toFixed(2)),
    fxRate: Number(fxRate.toFixed(6)),
    fee: Number(fee.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    expiresAt: Date.now() + QUOTE_EXPIRY_MS,
  }

  return NextResponse.json(response)
}
