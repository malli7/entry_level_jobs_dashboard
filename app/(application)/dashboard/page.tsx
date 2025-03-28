"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { User, LogOut, FileText } from "lucide-react"
import { getJobsForPage } from "@/lib/jobs/getSavedJobs"

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  useEffect(() => {
    const fetchJobs = async () => {
      const a = await getJobsForPage(1)
      console.log(a)
    }
    fetchJobs()
  }, [])
  
  
  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    if (!user.emailVerified) {
      router.push("/verify-email")
      return
    }

    if (!user.hasResume) {
      router.push("/resume-upload")
    }
  }, [user, router])

  if (!user || !user.emailVerified || !user.hasResume) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back, {user.displayName || user.email}</p>
          </div>
          <Button
            variant="outline"
            className="mt-4 md:mt-0 border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800 col-span-1">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-400" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
              {user.displayName && (
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="text-white">{user.displayName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500">Account Status</p>
                <div className="flex items-center">
                  <span
                    className={`h-2 w-2 rounded-full mr-2 ${user.emailVerified ? "bg-emerald-500" : "bg-yellow-500"}`}
                  ></span>
                  <p className="text-white">{user.emailVerified ? "Verified" : "Pending Verification"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800 col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-cyan-400" />
                Resume Information
              </CardTitle>
              <CardDescription>Information extracted from your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800/50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                  {user.resumeText ? user.resumeText.substring(0, 500) + "..." : "No resume text available"}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

