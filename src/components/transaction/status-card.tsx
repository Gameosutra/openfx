"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { TransactionStatus, TransactionResponse } from "@/lib/types"
import { TransactionStatusValue } from "@/lib/types"
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
import { StatusStepItem } from "@/components/transaction/status-step-item"

const STATUS_STEPS: TransactionStatus[] = [
  TransactionStatusValue.Processing,
  TransactionStatusValue.Sent,
  TransactionStatusValue.Settled,
]

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; description: string; icon: React.ReactNode; color: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }
> = {
  [TransactionStatusValue.Processing]: {
    label: "Processing",
    description: "Your payment is being processed. This may take a moment.",
    icon: <Clock className="h-6 w-6" />,
    color: "text-muted-foreground",
    badgeVariant: "secondary",
  },
  [TransactionStatusValue.Sent]: {
    label: "Sent",
    description: "Your transfer has been sent and is on its way to the recipient.",
    icon: <Send className="h-6 w-6" />,
    color: "text-chart-2",
    badgeVariant: "outline",
  },
  [TransactionStatusValue.Settled]: {
    label: "Settled",
    description: "Transfer complete. Funds have been delivered successfully.",
    icon: <CheckCircle2 className="h-6 w-6" />,
    color: "text-success",
    badgeVariant: "default",
  },
  [TransactionStatusValue.Failed]: {
    label: "Failed",
    description: "Something went wrong with your transfer. You have not been charged.",
    icon: <AlertTriangle className="h-6 w-6" />,
    color: "text-destructive",
    badgeVariant: "destructive",
  },
}

type StatusCardProps = {
  transactionId: string
  transaction: TransactionResponse | undefined
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onNewTransfer: () => void
}

export function StatusCard({
  transactionId,
  transaction,
  isLoading,
  error,
  onRetry,
  onNewTransfer,
}: StatusCardProps) {
  const currentStatus = transaction?.status ?? TransactionStatusValue.Processing
  const config = STATUS_CONFIG[currentStatus]
  const currentStepIndex = STATUS_STEPS.indexOf(currentStatus)
  const isTerminal = currentStatus === TransactionStatusValue.Settled || currentStatus === TransactionStatusValue.Failed

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              currentStatus === TransactionStatusValue.Settled
                ? "bg-success/10"
                : currentStatus === TransactionStatusValue.Failed
                ? "bg-destructive/10"
                : "bg-secondary"
            } ${config.color}`}
          >
            {currentStatus === TransactionStatusValue.Processing && (isLoading || !transaction) ? (
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

        {currentStatus !== TransactionStatusValue.Failed && (
          <div className="flex items-center justify-center gap-2">
            {STATUS_STEPS.map((step, index) => (
              <StatusStepItem
                key={step}
                label={STATUS_CONFIG[step].label}
                isCompleted={index <= currentStepIndex}
                isCurrent={index === currentStepIndex}
                showConnector={index < STATUS_STEPS.length - 1}
                stepNumber={index + 1}
              />
            ))}
          </div>
        )}

        <Separator />

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

        <div className="flex flex-col gap-3 sm:flex-row">
          {currentStatus === TransactionStatusValue.Failed && (
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
          {currentStatus === TransactionStatusValue.Settled && (
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
              onClick={onRetry}
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
  )
}
