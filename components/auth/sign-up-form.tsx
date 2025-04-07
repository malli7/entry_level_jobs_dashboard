"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { FirebaseError } from "firebase/app" // Import FirebaseError for better error typing

const signUpSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignUpFormValues = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  onSuccess?: () => void
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { signUpWithEmail } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      await signUpWithEmail(data.email, data.password, data.name)

      setIsSuccess(true)

      // Call onSuccess callback after 2 seconds
      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err: unknown) {
      console.error("Sign up error:", err)

      if (err instanceof FirebaseError) {
        // Handle Firebase-specific errors
        if (err.code === "auth/email-already-in-use") {
          setError("This email is already in use. Please try signing in instead.")
        } else {
          setError("Failed to create account. Please try again.")
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <CheckCircle className="h-12 w-12 text-emerald-500 mb-4" />
        <h3 className="text-xl font-medium text-white">Verification Email Sent!</h3>
        <p className="text-slate-400 mt-2">
          Please check your email and click the verification link to complete your registration.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            {...register("name")}
          />
          {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            {...register("email")}
          />
          {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            className="bg-slate-800/50 border-slate-700 text-white"
            {...register("password")}
          />
          {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            className="bg-slate-800/50 border-slate-700 text-white"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Create Account
        </Button>
      </form>

      <p className="text-xs text-slate-400 text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}

