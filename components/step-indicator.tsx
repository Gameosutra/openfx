"use client"

import type { AppStep } from "@/lib/types"
import { cn } from "@/lib/utils"

const STEPS: { key: AppStep; label: string; number: number }[] = [
  { key: "quote", label: "Quote", number: 1 },
  { key: "confirm", label: "Confirm", number: 2 },
  { key: "status", label: "Status", number: 3 },
]

type StepIndicatorProps = {
  currentStep: AppStep
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <nav aria-label="Transfer progress" className="flex items-center justify-center gap-2">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-secondary text-muted-foreground"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {step.number}
              </div>
              <span
                className={cn(
                  "text-sm hidden sm:inline",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  index < currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
