"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { JobForCharts } from "../page";
import { ChartEvent, ActiveElement } from 'chart.js';

interface JobsByJobTypeChartProps {
  allJobs: JobForCharts[];
}

const JobsByJobTypeChart = ({ allJobs }: JobsByJobTypeChartProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJobSite, setSelectedJobSite] = useState<string | null>(null);

  const processData = useCallback((jobs: JobForCharts[]) => {
    const filteredJobs = jobs.filter((job) => {
      return (
        (!selectedDate || job.date_posted === selectedDate) &&
        (!selectedLocation || job.location === selectedLocation) &&
        (!selectedCategory || job.category === selectedCategory) &&
        (!selectedJobSite || job.site === selectedJobSite)
      );
    });

    const jobCountByJobType = filteredJobs.reduce((acc, job) => {
      const jobType = job.job_type || "Unknown";
      acc[jobType] = (acc[jobType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(jobCountByJobType).map(([jobType, count]) => ({
      jobType,
      count,
    }));
  }, [selectedDate, selectedLocation, selectedCategory, selectedJobSite]);

  const chartData = useMemo(() => processData(allJobs), [allJobs, processData]);

  const colorPalette = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
    "rgba(201, 203, 207, 0.6)",
  ];

  const barChartData = {
    labels: chartData.map((item) => item.jobType),
    datasets: [
      {
        label: "Number of Jobs by Job Type",
        data: chartData.map((item) => item.count),
        backgroundColor: chartData.map((_, i) => colorPalette[i % colorPalette.length]),
        borderColor: chartData.map((_, i) =>
          colorPalette[i % colorPalette.length].replace("0.6", "1")
        ),
        borderWidth: 1,
      },
    ],
  };

  const handleBarClick = (event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      const jobType = chartData[elementIndex].jobType;

      const baseUrl = `/dashboard`;
      const queryParams = new URLSearchParams();
      queryParams.append("jobType", jobType);

      if (selectedDate) queryParams.append("datePosted", selectedDate);
      if (selectedLocation) queryParams.append("location", selectedLocation);
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (selectedJobSite) queryParams.append("jobSite", selectedJobSite);

      const fullUrl = `${baseUrl}?${queryParams.toString()}`;
      window.location.href = fullUrl;
    }
  };

  const chartOptions = {
    responsive: true,
    indexAxis: 'y' as const, // ✅ Horizontal bars
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Jobs by Job Type",
      },
    },
    onClick: handleBarClick,
  };

  return (
    <div className="jobs-by-job-type-chart p-8 space-y-12">
      <div className="filters grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div>
          <label className="block text-slate-400 mb-1">Date Posted</label>
          <select
            className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
            onChange={(e) => setSelectedDate(e.target.value || null)}
            value={selectedDate || ""}
          >
            <option value="">All Dates</option>
            {[...new Set(allJobs.map((job) => job.date_posted))].map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Location</label>
          <select
            className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
            onChange={(e) => setSelectedLocation(e.target.value || null)}
            value={selectedLocation || ""}
          >
            <option value="">All Locations</option>
            {[...new Set(allJobs.map((job) => job.location))].map((location) => (
              <option key={location} value={location}>
                {location}
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
            {[...new Set(allJobs.map((job) => job.category))].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Job Site</label>
          <select
            className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
            onChange={(e) => setSelectedJobSite(e.target.value || null)}
            value={selectedJobSite || ""}
          >
            <option value="">All Sites</option>
            {[...new Set(allJobs.map((job) => job.site))].map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">Jobs by Job Type</h3>
        <div style={{ height: "500px" }}>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default JobsByJobTypeChart;
