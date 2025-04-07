"use client";
import {  usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Job } from "../../page"; // Assuming Job interface is exported from the main dashboard page
import NavigationBar from "@/app/(application)/components/NavigationBar";

export default function JobDetails() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  console.log(id);
  const [job, setJob] = useState<Job | null>(null);

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
