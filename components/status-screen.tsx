"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { fetchTransactionStatus } from "@/lib/api"
import type { TransactionStatus, TransactionResponse } from "@/lib/types"
import {
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  RotateCcw,
  Home,
  Loader2,
  Headphones,
  ExternalLink,
} from "lucide-react"

const POLL_INTERVAL = 2000
const MAX_POLL_RETRIES = 3

type StatusScreenProps = {
  transactionId: string
  onNewTransfer: () => void
}

type StatusConfig = {
  label: string
  description: string
  icon: React.ReactNode
  color: string
  badgeVariant: "default" | "secondary" | "destructive" | "outline"
}

const STATUS_CONFIG: Record<TransactionStatus, StatusConfig> = {
  processing: {
    label: "Processing",
    description: "Your payment is being processed. This may take a moment.",
    icon: <Clock className="h-6 w-6" />,
    color: "text-muted-foreground",
    badgeVariant: "secondary",
  },
  sent: {
    label: "Sent",
    description:
      "Your transfer has been sent and is on its way to the recipient.",
    icon: <Send className="h-6 w-6" />,
    color: "text-chart-2",
    badgeVariant: "outline",
  },
  settled: {
    label: "Settled",
    description: "Transfer complete. Funds have been delivered successfully.",
    icon: <CheckCircle2 className="h-6 w-6" />,
    color: "text-success",
    badgeVariant: "default",
  },
  failed: {
    label: "Failed",
    description:
      "Something went wrong with your transfer. You have not been charged.",
    icon: <AlertTriangle className="h-6 w-6" />,
    color: "text-destructive",
    badgeVariant: "destructive",
  },
}

const STATUS_STEPS: TransactionStatus[] = [
  "processing",
  "sent",
  "settled",
]

export function StatusScreen({
  transactionId,
  onNewTransfer,
}: StatusScreenProps) {
  const [transaction, setTransaction] =
    useState<TransactionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pollErrors, setPollErrors] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isTerminal =
    transaction?.status === "settled" || transaction?.status === "failed"

  const poll = useCallback(async () => {
    try {
      const result = await fetchTransactionStatus(transactionId)
      setTransaction(result)
      setPollErrors(0)
      setError(null)

      // Stop polling on terminal states
      if (result.status === "settled" || result.status === "failed") {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    } catch (err) {
      setPollErrors((prev) => {
        const newCount = prev + 1
        if (newCount >= MAX_POLL_RETRIES) {
          setError(
            "Unable to get transaction status. Please check back later."
          )
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
        return newCount
      })
    }
  }, [transactionId])

  useEffect(() => {
    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [poll])

  const handleRetryPoll = () => {
    setPollErrors(0)
    setError(null)
    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL)
  }

  const currentStatus = transaction?.status ?? "processing"
  const config = STATUS_CONFIG[currentStatus]
  const currentStepIndex = STATUS_STEPS.indexOf(currentStatus)

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-6 pt-6">
          {/* Status Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                currentStatus === "settled"
                  ? "bg-success/10"
                  : currentStatus === "failed"
                  ? "bg-destructive/10"
                  : "bg-secondary"
              } ${config.color}`}
            >
              {currentStatus === "processing" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                config.icon
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold text-foreground">
                {config.label}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {config.description}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          {currentStatus !== "failed" && (
            <div className="flex items-center justify-center gap-2">
              {STATUS_STEPS.map((step, index) => {
                const stepConfig = STATUS_CONFIG[step]
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
                      >
                        {isCompleted && index < currentStepIndex ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          isCompleted
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {stepConfig.label}
                      </span>
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={`h-px w-8 sm:w-12 ${
                          index < currentStepIndex
                            ? "bg-primary"
                            : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <Separator />

          {/* Transaction Details */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-xs text-foreground">
                {transactionId}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={config.badgeVariant}>{config.label}</Badge>
            </div>
            {!isTerminal && !error && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Auto-refreshing status...</span>
              </div>
            )}
          </div>

          {/* Error / Retry for polling failures */}
          {error && (
            <div
              className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {currentStatus === "failed" && (
              <>
                <Button
                  variant="outline"
                  onClick={onNewTransfer}
                  className="flex-1 h-12 border-border"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() =>
                    window.open("mailto:support@openfx.com", "_blank")
                  }
                >
                  <Headphones className="h-4 w-4" />
                  Contact Support
                </Button>
              </>
            )}
            {currentStatus === "settled" && (
              <Button
                onClick={onNewTransfer}
                className="flex-1 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Home className="h-4 w-4" />
                New Transfer
              </Button>
            )}
            {error && (
              <Button
                onClick={handleRetryPoll}
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
            )}
            {!isTerminal && !error && (
              <div className="flex items-center justify-center w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() =>
                    window.open("mailto:support@openfx.com", "_blank")
                  }
                >
                  <ExternalLink className="h-3 w-3" />
                  Need help? Contact Support
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
