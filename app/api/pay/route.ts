import { NextResponse } from "next/server"
import type { PayRequest, PayResponse, TransactionStatus } from "@/lib/types"
import { setTransaction } from "@/lib/mock-transactions"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  await delay(800 + Math.random() * 400)

  const body = (await request.json()) as PayRequest

  if (Math.random() < 0.1) {
    return NextResponse.json(
      { error: "Payment processing failed. Please try again." },
      { status: 502 }
    )
  }

  const transactionId = `TXN-${generateId()}`
  const now = new Date().toISOString()
  const failed = Math.random() < 0.05

  setTransaction(transactionId, {
    id: transactionId,
    status: failed ? "failed" : "processing",
    sourceCurrency: "",
    destinationCurrency: "",
    sourceAmount: 0,
    destinationAmount: 0,
    fxRate: 0,
    fee: 0,
    createdAt: now,
    updatedAt: now,
    failed,
  })

  return NextResponse.json({ transactionId } satisfies PayResponse)
}
