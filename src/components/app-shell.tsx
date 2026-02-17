"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRightLeft } from "lucide-react"

const STEPS = [
  { path: "/quote", label: "Quote", number: 1 },
  { path: "/confirm", label: "Confirm", number: 2 },
  { path: "/transaction", label: "Status", number: 3 },
] as const

function getCurrentStep(pathname: string): number {
  if (pathname.startsWith("/transaction")) return 3
  if (pathname === "/confirm") return 2
  return 1
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentStep = getCurrentStep(pathname)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link
            href="/quote"
            className="flex items-center gap-2 text-foreground hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ArrowRightLeft className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              OpenFX
            </span>
          </Link>
          <span className="text-xs text-muted-foreground font-mono">
            International Transfers
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <nav
          aria-label="Transfer progress"
          className="flex items-center justify-center gap-2 mb-8"
        >
          {STEPS.map((step, index) => {
            const isCompleted = index + 1 < currentStep
            const isCurrent = index + 1 === currentStep
            return (
              <div key={step.path} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      isCompleted && "bg-primary text-primary-foreground"
                    } ${isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/20"} ${
                      !isCompleted && !isCurrent && "bg-secondary text-muted-foreground"
                    }`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-sm hidden sm:inline ${
                      isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-px w-6 sm:w-10 ${
                      index + 1 < currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </nav>

        {children}
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <p>This is a demo application. No real payments are processed.</p>
            <p className="font-mono">OpenFX · Simulated FX Platform</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
