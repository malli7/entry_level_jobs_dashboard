"use client"

import type React from "react"
import { CheckCircle, Sparkles, Zap, Search, BarChart, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="p-6 bg-slate-900/70 rounded-lg shadow-md backdrop-blur-md border border-slate-800">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

const JobPreviewSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-medium text-white">Junior Software Developer</h4>
            <p className="text-sm text-slate-400">TechStart Solutions</p>
          </div>
          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-3 py-1 text-sm font-medium">
            87% Match
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="bg-slate-700/50 rounded-full px-2 py-1">Remote</span>
          <span className="bg-slate-700/50 rounded-full px-2 py-1">Full-time</span>
          <span className="bg-slate-700/50 rounded-full px-2 py-1">React</span>
          <span className="bg-slate-700/50 rounded-full px-2 py-1">JavaScript</span>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          <span>Source: LinkedIn • Updated 2 hours ago</span>
        </div>
      </div>

      <div className="flex flex-col p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-medium text-white">Marketing Assistant</h4>
            <p className="text-sm text-slate-400">Brand Innovators Inc.</p>
          </div>
          <div className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full px-3 py-1 text-sm font-medium">
            72% Match
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="bg-slate-700/50 rounded-full px-2 py-1">Hybrid</span>
          <span className="bg-slate-700/50 rounded-full px-2 py-1">Entry-level</span>
          <span className="bg-slate-700/50 rounded-full px-2 py-1">Social Media</span>
          <span className="bg-slate-700/50 rounded-full px-2 py-1">Content</span>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          <span>Source: Indeed • Updated 5 hours ago</span>
        </div>
      </div>

      <div className="flex flex-col p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-medium text-white">Data Analyst Intern</h4>
            <p className="text-sm text-slate-400">DataViz Analytics</p>
          </div>
          <div className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full px-3 py-1 text-sm font-medium">
            93% Match
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="bg-slate-700/50 rounded-full px-2 py-1">On-site</span>
          <span className="bg-slate-700/50 rounded-full px-2 py-1">Internship</span>
          <span className="bg-slate-700/50 rounded-full px-2 py-1">Excel</span>
          <span className="bg-slate-700/50 rounded-full px-2 py-1">SQL</span>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          <span>Source: Google Jobs • Updated 1 day ago</span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden w-full">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 animate-gradient-x"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"></div>
        </div>

        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 leading-tight">
            Find Entry-Level Jobs That Match Your Skills
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl">
            Our AI analyzes your resume and matches you with the perfect entry-level positions from across the web
          </p>

          <div className="flex justify-center">
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 px-6 py-3 bg-slate-900/50 backdrop-blur-md rounded-full">
              <div className="text-cyan-400 font-medium">Real-time Job Matching</div>
              <div className="text-purple-400 font-medium">Multiple Job Sources</div>
              <div className="text-emerald-400 font-medium">Resume Analysis</div>
            </div>
          </div>

          <Button
            className="bg-gradient-to-r cursor-pointer from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium py-6 px-8 rounded-full text-lg"
            onClick={() => router.push("/auth")}
          >
            Find Your Perfect Match
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 w-full flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Why Use Our Job Matching Platform?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart className="h-8 w-8 text-emerald-400" />}
              title="AI-Powered Resume Analysis"
              description="Our algorithm analyzes your resume and skills to provide personalized job match scores for each position."
            />

            <FeatureCard
              icon={<Search className="h-8 w-8 text-blue-400" />}
              title="Multi-Source Job Aggregation"
              description="We pull entry-level positions from LinkedIn, Indeed, Google Jobs, and more - all in one place."
            />

            <FeatureCard
              icon={<Zap className="h-8 w-8 text-yellow-400" />}
              title="Instant Match Scoring"
              description="See exactly how well you match each job with our percentage-based compatibility scoring system."
            />

            <FeatureCard
              icon={<RefreshCw className="h-8 w-8 text-purple-400" />}
              title="Real-Time Updates"
              description="Our platform continuously scans job boards to bring you the latest opportunities as they're posted."
            />

            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-cyan-400" />}
              title="Entry-Level Focus"
              description="We specialize in jobs for new graduates and career-changers, filtering out positions requiring extensive experience."
            />

            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-pink-400" />}
              title="Skill Gap Analysis"
              description="Identify which skills you need to develop to improve your match scores for your desired career path."
            />
          </div>
        </div>
      </section>

      {/* Interactive Preview Section */}
      <section className="py-20 bg-slate-950 w-full flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
            See Your Job Matches in Real-Time
          </h2>

          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl rounded-3xl"></div>
            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-slate-800/50 rounded-full px-4 py-1 text-sm text-slate-300">Live Job Matches</div>
              </div>

              <JobPreviewSection />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-black w-full flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Start Your Career Journey Today
            </h2>

            <p className="text-xl text-slate-300">
              Upload your resume and get matched with entry-level positions that align with your skills and experience
            </p>

            <Button
              className="bg-gradient-to-r cursor-pointer from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium py-6 px-8 rounded-full text-lg"
              onClick={() => router.push("/auth")}
            >
              Find Your Match Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-black border-t border-slate-800 w-full flex items-center justify-center">
        <div className="container px-4 md:px-6">

          <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Entry Level Job Board. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

