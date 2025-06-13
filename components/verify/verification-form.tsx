"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function VerificationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [verificationMethod, setVerificationMethod] = useState<"email" | "phone">("email")
  const [contactInfo, setContactInfo] = useState("user@example.com")
  const [timeLeft, setTimeLeft] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6)
    setVerificationCode(newCode)

    // Focus the last filled input or the first empty one
    const lastFilledIndex = newCode.findIndex((digit) => !digit)
    const focusIndex = lastFilledIndex === -1 ? 5 : Math.max(0, lastFilledIndex - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const code = verificationCode.join("")
    if (code.length !== 6) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate verification process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, you would verify the code with your backend
      console.log("Verification code:", code)

      // Redirect to login page with verification success
      router.push("/login?verified=true")
    } catch (error) {
      console.error("Verification failed:", error)
      // Handle verification error
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      // Simulate resend process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reset timer
      setTimeLeft(60)

      // Clear current code
      setVerificationCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()

      console.log("Verification code resent")
    } catch (error) {
      console.error("Resend failed:", error)
    } finally {
      setIsResending(false)
    }
  }

  const isCodeComplete = verificationCode.every((digit) => digit !== "")

  return (
    <Card className="border-trigo-200 dark:border-trigo-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Verification Code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to{" "}
          <span className="font-medium">{verificationMethod === "email" ? contactInfo : "+63 *** *** **34"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 text-trigo-600 dark:text-trigo-400">
              {verificationMethod === "email" ? <Mail size={16} /> : <Phone size={16} />}
              <span className="text-sm">{verificationMethod === "email" ? "Email" : "SMS"}</span>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {verificationCode.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-bold border-2 focus:border-trigo-500"
                autoComplete="off"
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-trigo-600 hover:bg-trigo-700 text-white btn-glow"
            disabled={!isCodeComplete || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-trigo-600 dark:text-trigo-400 mb-2">Didn't receive the code?</p>
          <Button
            variant="outline"
            onClick={handleResendCode}
            disabled={timeLeft > 0 || isResending}
            className="text-sm hover:shadow-glow-sm"
          >
            {isResending ? "Resending..." : timeLeft > 0 ? `Resend in ${timeLeft}s` : "Resend Code"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t border-trigo-200 dark:border-trigo-800 pt-4">
        <div className="text-center w-full">
          <Link
            href="/register"
            className="text-sm text-trigo-600 hover:underline font-medium flex items-center justify-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Registration
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
