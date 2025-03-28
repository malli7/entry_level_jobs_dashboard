"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignInForm from "@/components/auth/sign-in-form"
import SignUpForm from "@/components/auth/sign-up-form"
import { useAuth } from "@/lib/auth-context"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("signin")
  const router = useRouter()
  const { user } = useAuth()
  console.log(user)

  // If user is already authenticated, redirect to dashboard or resume upload
  if (user) {
    if (user.hasResume) {
      router.push("/dashboard")
    } else {
      router.push("/resume-upload")
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome to Job Match</h1>
            <p className="text-slate-400 mt-2">Find entry-level jobs that match your skills</p>
          </div>

          <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm onSuccess={() => setActiveTab("signin")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

