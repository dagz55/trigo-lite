import { VerificationForm } from "@/components/verify/verification-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedLogo } from "@/components/animated-logo"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verify Account | TriGO",
  description: "Verify your TriGO account",
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-trigo-50 to-trigo-100 dark:from-trigo-900 dark:to-trigo-800 honeycomb-pattern">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <AnimatedLogo size={80} className="shadow-glow animate-pulse-glow rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-trigo-900 dark:text-white">Verify Your Account</h1>
          <p className="text-trigo-700 dark:text-trigo-300 mt-2">Enter the verification code we sent you</p>
        </div>

        <VerificationForm />
      </div>
    </div>
  )
}
