"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Doughnut } from "react-chartjs-2";
import { JobForCharts } from "../page";
import { ActiveElement, ChartEvent } from "chart.js";

interface JobsBySiteChartProps {
  allJobs: JobForCharts[];
}

const JobsBySiteChart = ({ allJobs }: JobsBySiteChartProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);

  const processData = useCallback((jobs: JobForCharts[]) => {
    const filteredJobs = jobs.filter((job) => {
      return (
        (!selectedDate || job.date_posted === selectedDate) &&
        (!selectedLocation || job.location === selectedLocation) &&
        (!selectedCategory || job.category === selectedCategory) &&
        (!selectedJobType || job.job_type === selectedJobType)
      );
    });

    const jobCountBySite = filteredJobs.reduce((acc, job) => {
      const site = job.site || "Unknown";
      acc[site] = (acc[site] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(jobCountBySite).map(([site, count]) => ({
      site,
      count,
    }));
  }, [selectedDate, selectedLocation, selectedCategory, selectedJobType]);

  const chartData = useMemo(() => processData(allJobs), [allJobs, processData]);

  const doughnutChartData = {
    labels: chartData.map((item) => item.site),
    datasets: [
      {
        label: "Number of Jobs by Site",
        data: chartData.map((item) => item.count),
        backgroundColor: [
          "rgba(75, 192, 192, 0.5)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(199, 199, 199, 0.5)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(199, 199, 199, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleChartClick = (event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const site = chartData[index].site;

      const queryParams = new URLSearchParams();
      queryParams.append("site", site);
      if (selectedDate) queryParams.append("datePosted", selectedDate);
      if (selectedLocation) queryParams.append("location", selectedLocation);
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (selectedJobType) queryParams.append("jobType", selectedJobType);

      const fullUrl = `/dashboard?${queryParams.toString()}`;
      window.location.href = fullUrl;
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Jobs by Site",
      },
    },
    onClick: handleChartClick,
  };

  return (
    <div className="jobs-by-site-chart p-8 space-y-12">
      <div className="filters grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">Jobs by Site</h3>
        <div style={{ height: "400px" }}>
          <Doughnut data={doughnutChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default JobsBySiteChart;
