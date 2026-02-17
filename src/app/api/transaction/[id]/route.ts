import { NextResponse } from "next/server"
import { getTransaction } from "@/lib/mock-transactions"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const txn = getTransaction(id)
  if (!txn) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  }
  return NextResponse.json(txn)
}
