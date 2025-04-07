"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Line, Bar } from "react-chartjs-2";
import { JobForCharts } from "../page";
import {
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { ChartEvent, ActiveElement } from 'chart.js';

interface TimeBasedChartsProps {
  allJobs: JobForCharts[];
}

const TimeBasedCharts = ({ allJobs }: TimeBasedChartsProps) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Process data for different charts
  const processData = useCallback((jobs: JobForCharts[]) => {
    // Filter jobs based on selected filters
    const filteredJobs = jobs.filter((job) => {
      return (
        (!selectedLocation || job.location === selectedLocation) &&
        (!selectedJobType || job.job_type === selectedJobType) &&
        (!selectedSite || job.site === selectedSite) &&
        (!selectedCategory || job.category === selectedCategory)
      );
    });

    // Group jobs by time period
    const jobsByTime = filteredJobs.reduce((acc, job) => {
      if (!job.date_posted || job.date_posted === "Unknown") return acc;

      const date = parseISO(job.date_posted);

      // Since 'day' is the only option, we can directly use startOfDay
      const timeKey:string = format(startOfDay(date), "yyyy-MM-dd");

      acc[timeKey] = (acc[timeKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort by date
    const sortedTimeKeys = Object.keys(jobsByTime).sort();

    // Calculate cumulative growth
    const cumulativeGrowth = sortedTimeKeys.reduce((acc, key) => {
      const prevValue = acc.length > 0 ? acc[acc.length - 1].value : 0;
      acc.push({
        label: key,
        value: prevValue + jobsByTime[key],
      });
      return acc;
    }, [] as { label: string; value: number }[]);

    return {
      timeSeriesData: sortedTimeKeys.map((key) => ({
        label: key,
        value: jobsByTime[key],
      })),
      cumulativeGrowth,
    };
  }, [selectedLocation, selectedJobType, selectedSite, selectedCategory]);

  const chartData = useMemo(
    () => processData(allJobs),
    [allJobs, processData]
  );


  // Prepare chart data for area chart (cumulative growth)
  const areaChartData = {
    labels: chartData.cumulativeGrowth.map((item) => item.label),
    datasets: [
      {
        label: "Cumulative Job Postings",
        data: chartData.cumulativeGrowth.map((item) => item.value),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  // Prepare chart data for bar chart (time series)
  const barChartData = {
    labels: chartData.timeSeriesData.map((item) => item.label),
    datasets: [
      {
        label: `Job Posting Frequency by Day`,
        data: chartData.timeSeriesData.map((item) => item.value),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Job Posting Trends Over Time",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleBarClick = (event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      const date = chartData.timeSeriesData[elementIndex].label;

      // Construct the URL with query parameters
      const baseUrl = `/dashboard`;
      const queryParams = new URLSearchParams();

      // Append the date to the query parameters
      queryParams.append("date", date);

      // Append other selected filters
      if (selectedLocation) queryParams.append("location", selectedLocation);
      if (selectedJobType) queryParams.append("jobType", selectedJobType);
      if (selectedSite) queryParams.append("site", selectedSite);
      if (selectedCategory) queryParams.append("category", selectedCategory);

      const fullUrl = `${baseUrl}?${queryParams.toString()}`;

      // Redirect to the constructed URL
      window.location.href = fullUrl;
    }
  };

  return (
    <div className="time-based-charts p-8 space-y-12">
      <div className="filters grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-slate-400 mb-1">Location</label>
          <select
            className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
            onChange={(e) => setSelectedLocation(e.target.value || null)}
            value={selectedLocation || ""}
          >
            <option value="">All Locations</option>
            {[...new Set(allJobs.map((job) => job.location))].map(
              (location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Job Type</label>
          <select
            className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
            onChange={(e) => setSelectedJobType(e.target.value || null)}
            value={selectedJobType || ""}
          >
            <option value="">All Job Types</option>
            {[...new Set(allJobs.map((job) => job.job_type))].map((jobType) => (
              <option key={jobType} value={jobType}>
                {jobType}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Site</label>
          <select
            className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
            onChange={(e) => setSelectedSite(e.target.value || null)}
            value={selectedSite || ""}
          >
            <option value="">All Sites</option>
            {[...new Set(allJobs.map((job) => job.site))].map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Category</label>
          <select
            className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            value={selectedCategory || ""}
          >
            <option value="">All Categories</option>
            {[...new Set(allJobs.map((job) => job.category))].map(
              (category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Cumulative Growth of Job Postings
          </h3>
          <div style={{ height: "400px" }}>
            <Line data={areaChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Job Posting Frequency
          </h3>
          <div style={{ height: "400px" }}>
            <Bar data={barChartData} options={{ ...chartOptions, onClick: handleBarClick }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeBasedCharts;
