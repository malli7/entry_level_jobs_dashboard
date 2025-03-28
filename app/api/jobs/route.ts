import { NextResponse } from "next/server";

const JOBS_API_URL =
  "https://job-scraper.up.railway.app/paginated-jobs?page_number=";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1"; // Default to page 1 if not provided

  try {
    const response = await fetch(`${JOBS_API_URL}${page}`);
    const data = await response.json();

    return NextResponse.json(data); // Return the data as JSON response
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
