"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PhoneInput } from "./phone-input"
import { GoogleSignInButton } from "./google-sign-in-button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "phone" | "username">("email")

  // Check for registration success message
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false)

  useEffect(() => {
    // Check if user was redirected from registration
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("registered") === "true") {
      setShowRegistrationSuccess(true)
      // Clear the URL parameter
      window.history.replaceState({}, "", "/login")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login process
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.push("/") // Redirect to home page after successful login
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Card className="border-trigo-200 dark:border-trigo-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Sign In</CardTitle>
        {showRegistrationSuccess && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Account created successfully! Please sign in to continue.
            </p>
          </div>
        )}
        <CardDescription>Choose your preferred login method</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="phone">Phone Number</TabsTrigger>
          </TabsList>

          <TabsContent value="credentials">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label htmlFor="login-method" className="text-xs text-trigo-600 dark:text-trigo-400">
                      Login Method
                    </Label>
                    <div className="flex mt-1 rounded-md overflow-hidden border border-trigo-200 dark:border-trigo-800">
                      <button
                        type="button"
                        onClick={() => setLoginMethod("email")}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium ${
                          loginMethod === "email"
                            ? "bg-trigo-600 text-white shadow-glow-sm"
                            : "bg-trigo-50 dark:bg-trigo-800 text-trigo-600 dark:text-trigo-400"
                        }`}
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMethod("username")}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium ${
                          loginMethod === "username"
                            ? "bg-trigo-600 text-white shadow-glow-sm"
                            : "bg-trigo-50 dark:bg-trigo-800 text-trigo-600 dark:text-trigo-400"
                        }`}
                      >
                        Username
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={loginMethod} className="text-xs text-trigo-600 dark:text-trigo-400">
                  {loginMethod === "email" ? "Email Address" : "Username"}
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-trigo-400">
                    {loginMethod === "email" ? <Mail size={16} /> : <User size={16} />}
                  </div>
                  <Input
                    id={loginMethod}
                    type={loginMethod === "email" ? "email" : "text"}
                    placeholder={loginMethod === "email" ? "name@example.com" : "johndoe"}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs text-trigo-600 dark:text-trigo-400">
                    Password
                  </Label>
                  <a href="/forgot-password" className="text-xs text-trigo-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-trigo-400">
                    <Lock size={16} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-2.5 text-trigo-400 hover:text-trigo-600 dark:hover:text-trigo-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-trigo-600 hover:bg-trigo-700 text-white btn-glow"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-trigo-200 dark:bg-trigo-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-zinc-900 px-2 text-trigo-500 dark:text-trigo-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <GoogleSignInButton />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="phone">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs text-trigo-600 dark:text-trigo-400">
                  Phone Number
                </Label>
                <PhoneInput />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-xs text-trigo-600 dark:text-trigo-400">
                  One-Time Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-trigo-400">
                    <Lock size={16} />
                  </div>
                  <Input id="otp" type="text" placeholder="Enter OTP" className="pl-9" maxLength={6} />
                </div>
                <Button type="button" variant="outline" size="sm" className="text-xs mt-1 h-8 hover:shadow-glow-sm">
                  Send OTP
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-trigo-600 hover:bg-trigo-700 text-white btn-glow"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In with Phone"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t border-trigo-200 dark:border-trigo-800 pt-4">
        <div className="text-center w-full">
          <p className="text-sm text-trigo-600 dark:text-trigo-400">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-trigo-600 hover:underline font-medium">
              Sign up
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
