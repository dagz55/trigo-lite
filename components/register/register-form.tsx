"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhoneInput } from "@/components/login/phone-input"
import { GoogleSignInButton } from "@/components/login/google-sign-in-button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  dateOfBirth: string
  gender: string
  address: string
  city: string
  agreeToTerms: boolean
  agreeToMarketing: boolean
}

// Simple hash function for client-side (in production, use server-side hashing)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "trigo_salt_2024") // Add salt
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationMethod, setRegistrationMethod] = useState<"email" | "phone">("email")
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    agreeToTerms: false,
    agreeToMarketing: false,
  })

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"

    if (registrationMethod === "email") {
      if (!formData.email.trim()) newErrors.email = "Email is required"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    } else {
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    }

    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.city) newErrors.city = "City is required"
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms and conditions"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setGeneralError(null)

    try {
      // Hash the password
      const hashedPassword = await hashPassword(formData.password)

      // Sanitize and prepare user data
      const userData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim() || null,
        password_hash: hashedPassword,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address.trim() || null,
        city: formData.city,
        agree_to_terms: formData.agreeToTerms,
        agree_to_marketing: formData.agreeToMarketing,
      }

      // Insert user data into Supabase
      const { data, error } = await supabase.from("users").insert([userData]).select()

      if (error) {
        console.error("Supabase error:", error)

        // Handle specific error cases
        if (error.code === "23505") {
          // Unique constraint violation
          if (error.message.includes("email")) {
            setErrors({ email: "This email is already registered" })
          } else if (error.message.includes("phone")) {
            setErrors({ phone: "This phone number is already registered" })
          } else {
            setGeneralError("An account with this information already exists")
          }
        } else if (error.code === "42P01") {
          // Table doesn't exist
          setGeneralError("Database not properly configured. Please contact support.")
        } else {
          setGeneralError("Registration failed. Please try again.")
        }
        return
      }

      console.log("User registered successfully:", data)

      // Clear form data for security
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        city: "",
        agreeToTerms: false,
        agreeToMarketing: false,
      })

      // Redirect to verification page or login with success message
      router.push("/verify?email=" + encodeURIComponent(userData.email))
    } catch (error) {
      console.error("Registration failed:", error)

      if (error instanceof Error) {
        setGeneralError(error.message || "Registration failed. Please try again.")
      } else {
        setGeneralError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <Card className="border-trigo-200 dark:border-trigo-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Create Account</CardTitle>
        <CardDescription>Fill in your details to get started</CardDescription>
        {generalError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="account">Account Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <form className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs text-trigo-600 dark:text-trigo-400">
                    First Name *
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-trigo-400">
                      <User size={16} />
                    </div>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Juan"
                      className={`pl-9 ${errors.firstName ? "border-red-500" : ""}`}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs text-trigo-600 dark:text-trigo-400">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Dela Cruz"
                    className={errors.lastName ? "border-red-500" : ""}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              {/* Date of Birth and Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-xs text-trigo-600 dark:text-trigo-400">
                    Date of Birth *
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-trigo-400">
                      <Calendar size={16} />
                    </div>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className={`pl-9 ${errors.dateOfBirth ? "border-red-500" : ""}`}
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      required
                    />
                  </div>
                  {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-xs text-trigo-600 dark:text-trigo-400">
                    Gender *
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs text-trigo-600 dark:text-trigo-400">
                  Address
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-trigo-400">
                    <MapPin size={16} />
                  </div>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street, Barangay"
                    className="pl-9"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs text-trigo-600 dark:text-trigo-400">
                  City *
                </Label>
                <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                  <SelectTrigger className={errors.city ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="las-pinas">Las Piñas</SelectItem>
                    <SelectItem value="paranaque">Parañaque</SelectItem>
                    <SelectItem value="muntinlupa">Muntinlupa</SelectItem>
                    <SelectItem value="makati">Makati</SelectItem>
                    <SelectItem value="pasay">Pasay</SelectItem>
                    <SelectItem value="taguig">Taguig</SelectItem>
                  </SelectContent>
                </Select>
                {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
              </div>
              {/* Continue Button for Personal Info Tab */}
              <Button
                type="button"
                onClick={() => {
                  // Validate personal info fields before continuing
                  const personalInfoErrors: Partial<FormData> = {}

                  if (!formData.firstName.trim()) personalInfoErrors.firstName = "First name is required"
                  if (!formData.lastName.trim()) personalInfoErrors.lastName = "Last name is required"
                  if (!formData.dateOfBirth) personalInfoErrors.dateOfBirth = "Date of birth is required"
                  if (!formData.gender) personalInfoErrors.gender = "Gender is required"
                  if (!formData.city) personalInfoErrors.city = "City is required"

                  if (Object.keys(personalInfoErrors).length > 0) {
                    setErrors(personalInfoErrors)
                    return
                  }

                  // Clear any existing errors and switch to Account Setup tab
                  setErrors({})
                  setGeneralError(null)
                  const accountTab = document.querySelector('[data-value="account"]') as HTMLButtonElement
                  if (accountTab) {
                    accountTab.click()
                  }
                }}
                className="w-full bg-trigo-600 hover:bg-trigo-700 text-white btn-glow mt-4"
              >
                Continue to Account Setup
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="account">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Method Selection */}
              <div className="space-y-2">
                <Label className="text-xs text-trigo-600 dark:text-trigo-400">Registration Method *</Label>
                <div className="flex mt-1 rounded-md overflow-hidden border border-trigo-200 dark:border-trigo-800">
                  <button
                    type="button"
                    onClick={() => setRegistrationMethod("email")}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium ${
                      registrationMethod === "email"
                        ? "bg-trigo-600 text-white shadow-glow-sm"
                        : "bg-trigo-50 dark:bg-trigo-800 text-trigo-600 dark:text-trigo-400"
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationMethod("phone")}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium ${
                      registrationMethod === "phone"
                        ? "bg-trigo-600 text-white shadow-glow-sm"
                        : "bg-trigo-50 dark:bg-trigo-800 text-trigo-600 dark:text-trigo-400"
                    }`}
                  >
                    Phone
                  </button>
                </div>
              </div>

              {/* Email or Phone Input */}
              {registrationMethod === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs text-trigo-600 dark:text-trigo-400">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-trigo-400">
                      <Mail size={16} />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className={`pl-9 ${errors.email ? "border-red-500" : ""}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs text-trigo-600 dark:text-trigo-400">
                    Phone Number *
                  </Label>
                  <PhoneInput />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>
              )}

              {/* Password Fields */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs text-trigo-600 dark:text-trigo-400">
                  Password *
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-trigo-400">
                    <Lock size={16} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-9 pr-9 ${errors.password ? "border-red-500" : ""}`}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                <p className="text-xs text-trigo-500">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs text-trigo-600 dark:text-trigo-400">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-trigo-400">
                    <Lock size={16} />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-9 pr-9 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-2.5 text-trigo-400 hover:text-trigo-600 dark:hover:text-trigo-300"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    className={errors.agreeToTerms ? "border-red-500" : ""}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="agreeToTerms"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{" "}
                      <a href="#" className="text-trigo-600 hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-trigo-600 hover:underline">
                        Privacy Policy
                      </a>
                      *
                    </label>
                    {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToMarketing"
                    checked={formData.agreeToMarketing}
                    onCheckedChange={(checked) => handleInputChange("agreeToMarketing", checked as boolean)}
                  />
                  <label
                    htmlFor="agreeToMarketing"
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I would like to receive promotional emails and updates about TriGO services
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-trigo-600 hover:bg-trigo-700 text-white btn-glow"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-trigo-200 dark:bg-trigo-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-zinc-900 px-2 text-trigo-500 dark:text-trigo-400">
                    Or register with
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <GoogleSignInButton />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t border-trigo-200 dark:border-trigo-800 pt-4">
        <div className="text-center w-full">
          <p className="text-sm text-trigo-600 dark:text-trigo-400">
            Already have an account?{" "}
            <a href="/login" className="text-trigo-600 hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
