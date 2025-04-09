"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Job } from "../../page"; // Assuming Job interface is exported from the main dashboard page
import NavigationBar from "@/app/(application)/components/NavigationBar";
import { useAuth } from "@/lib/auth-context";

export default function JobDetails() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const [job, setJob] = useState<Job | null>(null);
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth(); // Assuming your auth provider gives you the user object

  useEffect(() => {
    if (id) {
      let foundJob = null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("jobs_page_")) {
          const storedJobs = localStorage.getItem(key);
          if (storedJobs) {
            const { jobs } = JSON.parse(storedJobs);
            foundJob = jobs.find((job: Job) => job.id === id);
            if (foundJob) break;
          }
        }
      }
      setJob(foundJob);
    }
  }, [id]);

  const handleGenerateResumeScore = async () => {
    if (!user || !user.uid) {
      console.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      console.log(user.uid, id);
      const response = await fetch("/api/resume-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_description: job?.description,
          user_id: user.uid,
          job_id: id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate resume score");
      }

      const data = await response.json();
      console.log(data);
      setResumeScore(data.match_score);
      setFeedback(data.feedback);
    } catch (error) {
      console.error("Error generating resume score:", error);
    } finally {
      setLoading(false);
    }
  };

  function formatJobDescription(description: string) {
    // Replace **text** with <strong>text</strong> and ensure it starts on a new line
    description = description.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Replace * text with <li>text</li> and ensure it starts on a new line
    description = description.replace(/\*\s(.*?)(?=\n|$)/g, "<li>$1</li>");

    // Remove unnecessary backslashes
    description = description.replace(/\\/g, "");

    // Ensure new lines are respected in HTML
    description = description.replace(/\n/g, "<br>");

    return description;
  }

  if (!job) return <p>Loading...</p>;

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-slate-800 p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-4">{job.title}</h1>
          <p className="text-slate-400 mb-2">Company: {job.company}</p>
          <p className="text-slate-400 mb-2">Location: {job.location}</p>

          <p className="text-slate-400 mb-2">
            Job Type: {job.job_type ? job.job_type : "Unknown"}
          </p>

          <p className="text-slate-400 mb-2">Category: {job.category}</p>
          <p className="text-slate-400 mb-2">Posted on: {job.date_posted}</p>
          <p className="text-slate-400 mb-4">Site: {job.site}</p>
          <div className="text-white">
            <h2 className="text-2xl font-semibold mb-2">Job Description</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: formatJobDescription(job.description),
              }}
            />
          </div>
          <div className="mt-6 text-white relative backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            {resumeScore === null && (
              <button
                onClick={handleGenerateResumeScore}
              className="relative z-10 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-pink-500 hover:to-purple-600 transition-all duration-300 ease-in-out hover:scale-105"
            >
                {loading ? "Generating..." : "🚀 View/Generate Resume Score"}
              </button>
            )}

            {resumeScore !== null && (
              <div className="mt-6 bg-white/5 border border-cyan-400/30 p-4 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                <p className="text-cyan-300 font-semibold text-lg mb-2">
                  ✨ Match Score:{" "}
                  <span className="text-white">{resumeScore}</span>
                </p>
                {feedback?.map((feed, idx) => (
                  <p key={idx} className="text-slate-300 ml-2">
                    {"👉"} {feed}
                  </p>
                ))}
              </div>
            )}

          </div>

          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-4 block"
          >
            Apply Now
          </a>
        </div>
      </div>
    </>
  );
}
