const JOBS_API_URL = "/api/jobs?page_number=";

const fetchJobs = async (page: string) => {
  const cacheKey = `jobs_page_${page}`;
  const now = Date.now();

  if (typeof window !== "undefined") {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (now - timestamp < 15 * 60 * 1000) {
        return data;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
  }

  try {
    const response = await fetch(`${JOBS_API_URL}${page}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    if (typeof window !== "undefined") {
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
    }

    return data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
};

export const getJobsForPage = async (page: number) => {
  try {
    const jobs = await fetchJobs(page.toString());
    return jobs.slice((page - 1) * 10, page * 10); 
  } catch (error) {
    console.error(error);
    return [];
  }
};