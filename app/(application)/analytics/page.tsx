"use client";
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import JobsByCategoryChart from "./components/JobsByCategoryChart";
import TimeBasedCharts from "./components/TimeBasedCharts";
import LocationBasedCharts from "./components/LocationBasedCharts";
import NavigationBar from "../components/NavigationBar";
import JobsBySiteChart from "./components/JobsBySiteChart";
import JobsByJobTypeChart from "./components/JobsByJobTypeChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  TimeScale
);

export type JobForCharts = {
  date_posted: string;
  location: string;
  category: string;
  company: string;
  job_type: string;
  site: string;
};
const AnalyticsPage = () => {
  const [allJobs, setAllJobs] = useState<JobForCharts[]>([]);

  useEffect(() => {
    // Fetch all job data and store in localStorage with expiry
    const fetchData = async () => {
      const storedData = localStorage.getItem("jobs_data");
      const expiry = localStorage.getItem("jobs_data_expiry");
      const now = new Date().getTime();

      if (storedData && expiry && now < parseInt(expiry)) {
        const { jobs } = JSON.parse(storedData);
        const processedJobs = jobs.map((job: JobForCharts) => ({
          date_posted: job.date_posted || "Unknown",
          location: job.location || "Unknown",
          category: job.category || "Unknown",
          company: job.company || "Unknown",
          job_type: job.job_type || "Unknown",
          site: job.site || "Unknown",
        }));
        setAllJobs(processedJobs);
      } else {
        // Fetch data from API (assuming an API endpoint exists)
        const response = await fetch("/api/alljobs");
        const data = await response.json();
        const processedJobs = data.jobs.map((job: JobForCharts) => ({
          date_posted: job.date_posted || "Unknown",
          location: job.location || "Unknown",
          category: job.category || "Unknown",
          company: job.company || "Unknown",
          job_type: job.job_type || "Unknown",
          site: job.site || "Unknown",
        }));
        localStorage.setItem(
          "jobs_data",
          JSON.stringify({ jobs: processedJobs })
        );
        localStorage.setItem("jobs_data_expiry", (now + 86400000).toString());
        setAllJobs(processedJobs);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="analytics-page">
      <NavigationBar />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4"> Jobs by Category</h2>
        <p className="text-slate-600 mb-8">This chart provides a visual representation of the number of jobs available in each category. Use the filters to refine the data displayed.</p>
        <JobsByCategoryChart allJobs={allJobs} />
        
        <h2 className="text-xl font-semibold mt-12 mb-4">Time-Based Analysis</h2>
        <p className="text-slate-600 mb-8">These charts show job posting trends over time, cumulative growth, and posting frequency. Use the filters to refine the data displayed.</p>
        <TimeBasedCharts allJobs={allJobs} />

        <h2 className="text-xl font-semibold mt-12 mb-4">Location-Based Analysis</h2>
        <p className="text-slate-600 mb-8">These charts show the distribution of jobs by location and a hierarchical view of jobs by location and category. Use the filters to refine the data displayed.</p>
        <LocationBasedCharts allJobs={allJobs} />

        <h2 className="text-xl font-semibold mt-12 mb-4">Jobs by Site</h2>
        <p className="text-slate-600 mb-8">This chart shows the distribution of jobs by site. Use the filters to refine the data displayed.</p>
        <JobsBySiteChart allJobs={allJobs} />

        <h2 className="text-xl font-semibold mt-12 mb-4">Jobs by Job Type</h2>
        <p className="text-slate-600 mb-8">This chart shows the distribution of jobs by job type. Use the filters to refine the data displayed.</p>
        <JobsByJobTypeChart allJobs={allJobs} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
