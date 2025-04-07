"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { JobFilters } from "../components/JobFilters";
import NavigationBar from "../components/NavigationBar";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  entry_level: string;
  description: string;
  job_url: string;
  company_url: string;
  date_posted: string;
  category: string;
  site: string;
}

interface Filters {
  search: string;
  jobType: string;
  location: string;
  category: string;
  datePosted: string;
  site: string;
}

interface JobsResponse {
  jobs: Job[];
  categories: string[];
  locations: string[];
  jobTypes: string[];
  sites: string[];
  dateOptions: string[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<Filters>({
    search: "",
    jobType: "",
    location: "",
    category: "",
    datePosted: "",
    site: "",
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [dateOptions, setDateOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobs = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs?page=${page}`);
      const data: JobsResponse = await response.json();
      const jobsData = {
        ...data,
        timestamp: Date.now(),
      };
      // Store each page's data separately
      localStorage.setItem(`jobs_page_${page}`, JSON.stringify(jobsData));
      return data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getJobs = useCallback(async (page: number = 1) => {
    // Check if we have this page's data in localStorage
    const storedPageData = localStorage.getItem(`jobs_page_${page}`);
    if (storedPageData) {
      const {
        jobs,
        categories,
        locations,
        jobTypes,
        sites,
        dateOptions,
        timestamp,
      } = JSON.parse(storedPageData);
      const fifteenMinutes = 15 * 60 * 1000;
      if (Date.now() - timestamp < fifteenMinutes) {
        return { jobs, categories, locations, jobTypes, sites, dateOptions };
      }
    }
    return await fetchJobs(page);
  }, [fetchJobs]);

  const loadMoreJobs = async () => {
    const nextPage = currentPage + 1;
    const data = await getJobs(nextPage);
    if (data) {
      // Create a Set of existing job IDs to check for duplicates
      const existingJobIds = new Set(jobs.map((job) => job.id));

      // Filter out duplicate jobs
      const newJobs = data.jobs.filter(
        (job: Job) => !existingJobIds.has(job.id)
      );

      // Create Sets for existing categories, locations, etc.
      const existingCategories = new Set(categories);
      const existingLocations = new Set(locations);
      const existingJobTypes = new Set(jobTypes);
      const existingSites = new Set(sites);
      const existingDates = new Set(dateOptions);

      // Filter out duplicates from new data
      const newCategories = data.categories.filter(
        (cat: string) => !existingCategories.has(cat)
      );
      const newLocations = data.locations.filter(
        (loc: string) => !existingLocations.has(loc)
      );
      const newJobTypes = data.jobTypes.filter(
        (type: string) => !existingJobTypes.has(type)
      );
      const newSites = data.sites.filter(
        (site: string) => !existingSites.has(site)
      );
      const newDates = data.dateOptions.filter(
        (date: string) => !existingDates.has(date)
      );

      // Update state with new unique data
      setJobs((prevJobs) => [...prevJobs, ...newJobs]);
      setCategories((prevCategories) => [...prevCategories, ...newCategories]);
      setLocations((prevLocations) => [...prevLocations, ...newLocations]);
      setJobTypes((prevJobTypes) => [...prevJobTypes, ...newJobTypes]);
      setSites((prevSites) => [...prevSites, ...newSites]);
      setDateOptions((prevDates) => [...prevDates, ...newDates]);
      setCurrentPage(nextPage);
    }
  };

  const filterJobs = () => {
    return jobs.filter((job) => {
      return (
        (activeFilters.search === "" ||
          job.title
            .toLowerCase()
            .includes(activeFilters.search.toLowerCase()) ||
          job.company
            .toLowerCase()
            .includes(activeFilters.search.toLowerCase())) &&
        (activeFilters.jobType === "all" ||
          activeFilters.jobType === "" ||
          job.job_type === activeFilters.jobType) &&
        (activeFilters.location === "all" ||
          activeFilters.location === "" ||
          job.location
            .toLowerCase()
            .includes(activeFilters.location.toLowerCase())) &&
        (activeFilters.category === "all" ||
          activeFilters.category === "" ||
          job.category === activeFilters.category) &&
        (activeFilters.site === "all" ||
          activeFilters.site === "" ||
          job.site === activeFilters.site)
      );
    });
  };

  const updateURLWithFilters = (filters: Filters) => {
    const activeFilters = Object.entries(filters).reduce(
      (acc: Partial<Filters>, [key, value]) => {
        if (value && value !== "all") {
          acc[key as keyof Filters] = value;
        }
        return acc;
      },
      {} as Partial<Filters>
    );
    const query = new URLSearchParams(activeFilters as Record<string, string>).toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  };

  const handleFilterChange = (filters: Filters) => {
    setActiveFilters(filters);
    updateURLWithFilters(filters);
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const initialFilters: Filters = {
      search: query.get("search") || "",
      jobType: query.get("jobType") || "",
      location: query.get("location") || "",
      category: query.get("category") || "",
      datePosted: query.get("datePosted") || "",
      site: query.get("site") || "",
    };
    setActiveFilters(initialFilters);
  }, [getJobs, user]);

  useEffect(() => {
    // Fetch first page of jobs when the component mounts
    getJobs(1).then((data) => {
      if (data) {
        setJobs(data.jobs);
        setCategories(data.categories);
        setLocations(data.locations);
        setJobTypes(data.jobTypes);
        setSites(data.sites);
        setDateOptions(data.dateOptions);
      }
    });
  }, [getJobs, user]);

  if (!user || !user.emailVerified || !user.hasResume) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <NavigationBar />
        <div className="flex justify-center items-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome, {user.displayName || user.email}
          </h1>
        </div>
        <JobFilters
          onFilterChange={handleFilterChange}
          categories={categories}
          locations={locations}
          jobTypes={jobTypes}
          sites={sites}
          dateOptions={dateOptions}
        />
        <div className="mt-8">
          <p className="text-white mb-4">Total Jobs: {filterJobs().length}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterJobs().map((job) => (
              <div
                key={job.id}
                className="bg-slate-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => router.push(`/dashboard/job/${job.id}`)}
              >
                <div className="relative">
                  <span className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                    {job.job_type ? job.job_type : "Unknown"}
                  </span>
                  <h3 className="text-white font-semibold text-lg">
                    {job.title}
                  </h3>
                  <p className="text-slate-400">{job.company}</p>
                  <p className="text-slate-400">{job.location}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Button
              onClick={loadMoreJobs}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
