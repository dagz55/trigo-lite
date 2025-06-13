import { RegisterForm } from "@/components/register/register-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedLogo } from "@/components/animated-logo"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register | TriGO",
  description: "Create your TriGO account",
}

export default function RegisterPage() {
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
          <h1 className="text-3xl font-bold text-trigo-900 dark:text-white">Join TriGO</h1>
          <p className="text-trigo-700 dark:text-trigo-300 mt-2">Create your account to start riding</p>
        </div>

        <RegisterForm />

        <div className="mt-8 text-center text-sm text-trigo-700 dark:text-trigo-400">
          <p>
            By creating an account, you agree to our{" "}
            <a href="#" className="text-trigo-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-trigo-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
