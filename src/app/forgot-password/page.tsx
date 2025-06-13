import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedLogo } from "@/components/animated-logo"

export const metadata: Metadata = {
  title: "Forgot Password | TriGO",
  description: "Reset your TriGO account password",
}

export default function ForgotPasswordPage() {
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
          <h1 className="text-3xl font-bold text-trigo-900 dark:text-white">Forgot Password</h1>
          <p className="text-trigo-700 dark:text-trigo-300 mt-2">Enter your email to reset your password</p>
        </div>

        <Card className="border-trigo-200 dark:border-trigo-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Reset Password</CardTitle>
            <CardDescription>We&apos;ll send you a link to reset your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-trigo-600 dark:text-trigo-400">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-trigo-400">
                    <Mail size={16} />
                  </div>
                  <Input id="email" type="email" placeholder="name@example.com" className="pl-9" required />
                </div>
              </div>

              <Button type="submit" className="w-full bg-trigo-600 hover:bg-trigo-700 text-white btn-glow">
                Send Reset Link
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-trigo-200 dark:border-trigo-800 pt-4">
            <div className="text-center w-full">
              <Link
                href="/login"
                className="text-sm text-trigo-600 hover:underline font-medium flex items-center justify-center gap-1"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
