import { db } from "@/lib/firebase/config";
import { getDocs, collection } from "firebase/firestore";
import { NextResponse } from "next/server";

 interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    job_type: string;
    entry_level: string;
    description: string;
    job_url: string;
    company_url: string;
    date_posted: {seconds : number} | string
    category: string;
    site: string;
  }

export async function GET() {
  try {
    const jobsSnapshot = await getDocs(collection(db, "jobs"));
    const jobs = jobsSnapshot.docs.map((doc) => doc.data() as Job);

    const categories = new Set();
    const locations = new Set();
    const jobTypes = new Set();
    const sites = new Set();
    const dateOptions = new Set<string>();

    jobs.forEach((job) => {
      if (job.category) categories.add(job.category);
      if (job.location) locations.add(job.location);
      if (job.job_type) jobTypes.add(job.job_type);
      if (job.site) sites.add(job.site);

      if (typeof job.date_posted === 'object' && 'seconds' in job.date_posted) {
        const date = new Date(job.date_posted.seconds * 1000);
        const formattedDate = date.toISOString().split("T")[0];
        job.date_posted = formattedDate;
        dateOptions.add(formattedDate);
      } else if (typeof job.date_posted === 'string') {
        dateOptions.add(job.date_posted);
      }
    });

    return NextResponse.json({
      jobs,
      categories: Array.from(categories),
      locations: Array.from(locations),
      jobTypes: Array.from(jobTypes),
      sites: Array.from(sites),
      dateOptions: Array.from(dateOptions),
    });
  } catch (error) {
    console.error("Error fetching all jobs from Firestore:", error);
    return NextResponse.json(
      { error: "Failed to fetch all jobs from Firestore" },
      { status: 500 }
    );
  }
}
