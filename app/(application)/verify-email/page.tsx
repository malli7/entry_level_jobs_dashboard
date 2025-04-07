"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase/config"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

export default function VerifyEmailPage() {
  const { user, resendVerificationEmail, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
    } else if (user.emailVerified) {
      if (user.hasResume) {
        router.push("/dashboard")
      } else {
        router.push("/resume")
      }
    }
  }, [user, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const checkVerification = async () => {
    setLoading(true)
    try {
      // Force refresh the user token
      if (auth.currentUser) {
        await auth.currentUser.reload()

        if (auth.currentUser.emailVerified) {
          const userRef = doc(db, "users", auth.currentUser.uid)
          await updateDoc(userRef, { emailVerified: true })
          await auth.currentUser.reload()
          
          router.push("/resume")
          
        } else {
          setError("Email not verified yet. Please check your inbox and spam folder.")
        }
      }
    } catch (err) {
      console.error("Error checking verification:", err)
      setError("Failed to check verification status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await resendVerificationEmail()
      setSuccess("Verification email sent! Please check your inbox and spam folder.")
      setCountdown(60) // Set 60 second cooldown
    } catch (err) {
      console.error("Error sending verification email:", err)
      setError("Failed to send verification email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth")
  }

  if (!user || user.emailVerified) {
    return null 
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Mail className="h-5 w-5 mr-2 text-purple-400" />
            Verify Your Email
          </CardTitle>
          <CardDescription>Please verify your email address to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-purple-500/20 p-3 rounded-full mb-4">
                <Mail className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Verification Required</h3>
              <p className="text-slate-400">
               {" We've sent a verification email to"} <span className="text-white font-medium">{user.email}</span>
              </p>
              <p className="text-slate-400 mt-2">
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-emerald-500/10 border-emerald-500/50 text-emerald-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            onClick={checkVerification}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
           {" I've Verified My Email"}
          </Button>

          <Button
            variant="outline"
            className="w-full border-slate-700 text-white hover:bg-slate-800"
            onClick={handleResendEmail}
            disabled={loading || countdown > 0}
          >
            {countdown > 0 ? `Resend Email (${countdown}s)` : "Resend Verification Email"}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-transparent"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

