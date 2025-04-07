import { db } from "@/lib/firebase/config";
import {  getDocs, collection, query, orderBy, limit, startAfter } from "firebase/firestore";
import { NextResponse } from "next/server";



interface Job {
  category?: string;
  location?: string;
  job_type?: string;
  site?: string;
  date_posted?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 20);
    const pageSize = 20;

    let jobsQuery;
    let jobsSnapshot;

    if (page === 1) {
      jobsQuery = query(
        collection(db, "jobs"),
        orderBy("date_posted"),
        limit(pageSize)
      );
      jobsSnapshot = await getDocs(jobsQuery);
    } else {
      const firstPageQuery = query(
        collection(db, "jobs"),
        orderBy("date_posted"),
        limit((page - 1) * pageSize)
      );
      const firstPageSnapshot = await getDocs(firstPageQuery);
      const lastVisible = firstPageSnapshot.docs[firstPageSnapshot.docs.length - 1];

      if (lastVisible) {
        jobsQuery = query(
          collection(db, "jobs"),
          orderBy("date_posted"),
          startAfter(lastVisible),
          limit(pageSize)
        );
        jobsSnapshot = await getDocs(jobsQuery);
      } else {
        return NextResponse.json({
          jobs: [],
          categories: [],
          locations: [],
          jobTypes: [],
          sites: [],
        });
      }
    }

    const jobs = jobsSnapshot.docs.map(doc => {
      const jobData = doc.data();
      if (jobData.date_posted) {
        const date = new Date(jobData.date_posted.seconds * 1000);
        const formattedDate = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
        jobData.date_posted = formattedDate;
      }
      return jobData;
    });

    const categories = new Set();
    const locations = new Set();
    const jobTypes = new Set();
    const sites = new Set();
    const dateOptions = new Set<string>();

    jobs.forEach((job: Job) => {
      if (job.category) categories.add(job.category);
      if (job.location) locations.add(job.location);
      if (job.job_type) jobTypes.add(job.job_type);
      if (job.site) sites.add(job.site);
      if (job.date_posted) {
        dateOptions.add(job.date_posted as string);
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
    console.error("Error fetching jobs from Firestore:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs from Firestore" },
      { status: 500 }
    );
  }
}
