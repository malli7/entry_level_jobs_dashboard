import { db } from "@/lib/firebase/config";
import {
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  deleteDoc,
  doc,
  Query,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { NextResponse } from "next/server";

interface Job {
  category?: string;
  location?: string;
  job_type?: string;
  site?: string;
  date_posted?: string;
  company?: string;
  title?: string;
}

const fetchValidJobs = async (page: number, pageSize: number): Promise<Job[]> => {
  const validJobs: Job[] = [];
  let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
  let attempts = 0;

  while (validJobs.length < pageSize && attempts < 5) {
    const batchSize = (pageSize - validJobs.length) + 5; // Fetch a few extras in case some are invalid
    const baseQuery: Query = query(
      collection(db, "jobs"),
      orderBy("date_posted"),
      ...(lastVisible ? [startAfter(lastVisible)] : []),
      limit(batchSize)
    );

    const snapshot = await getDocs(baseQuery);
    if (snapshot.empty) break;

    lastVisible = snapshot.docs[snapshot.docs.length - 1];

    for (const docSnap of snapshot.docs) {
      const jobData = docSnap.data();

      // Validate company and title
      if (!jobData.company || !jobData.title) {
        await deleteDoc(doc(db, "jobs", docSnap.id));
        continue;
      }

      if (jobData.date_posted) {
        const date = new Date(jobData.date_posted.seconds * 1000);
        jobData.date_posted = date.toISOString().split("T")[0];
      }

      validJobs.push(jobData);

      if (validJobs.length === pageSize) break;
    }

    attempts++;
  }

  return validJobs;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 20;

    const jobs = await fetchValidJobs(page, pageSize);

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
      if (job.date_posted) dateOptions.add(job.date_posted);
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
