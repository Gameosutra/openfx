"use client"

import { CheckCircle2 } from "lucide-react"

type StatusStepItemProps = {
  label: string
  isCompleted: boolean
  isCurrent: boolean
  showConnector: boolean
  stepNumber: number
}

export function StatusStepItem({
  label,
  isCompleted,
  isCurrent,
  showConnector,
  stepNumber,
}: StatusStepItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center gap-1">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
            isCompleted
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
        >
          {isCompleted && !isCurrent ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            stepNumber
          )}
        </div>
        <span
          className={`text-xs ${
            isCompleted ? "font-medium text-foreground" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
      </div>
      {showConnector && (
        <div
          className={`h-px w-8 sm:w-12 ${
            isCompleted ? "bg-primary" : "bg-border"
          }`}
        />
      )}
    </div>
  )
}
