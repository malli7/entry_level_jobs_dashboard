"use client";

import React, { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { JobForCharts } from "../page";
import { ChartEvent, ActiveElement } from 'chart.js';

const JobsByCategoryChart = ({ allJobs }: { allJobs: JobForCharts[] }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  // Process data for different charts
  const processData = (jobs: JobForCharts[]) => {
    const jobCountByCategory = jobs.reduce((acc, job) => {
      const category = job.category || "Unknown";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      jobCountByCategory: Object.entries(jobCountByCategory).map(
        ([category, count]) => ({ category, count })
      ),
    };
  };

  const handleFilterChange = () => {
    const filteredJobs = allJobs.filter((job) => {
      return (
        (!selectedDate || job.date_posted === selectedDate) &&
        (!selectedLocation || job.location === selectedLocation) &&
        (!selectedJobType || job.job_type === selectedJobType) &&
        (!selectedSite || job.site === selectedSite)
      );
    });
    return processData(filteredJobs);
  };

  const filteredChartData = handleFilterChange();

  const handleBarClick = (event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      const category = filteredChartData.jobCountByCategory[elementIndex].category;

      // Construct the URL with query parameters
      const baseUrl = `/dashboard`;
      const queryParams = new URLSearchParams();

      // Append the category to the query parameters
      queryParams.append("category", category);

      // Append other selected filters
      if (selectedDate) queryParams.append("datePosted", selectedDate);
      if (selectedLocation) queryParams.append("location", selectedLocation);
      if (selectedJobType) queryParams.append("jobType", selectedJobType);
      if (selectedSite) queryParams.append("site", selectedSite);

      const fullUrl = `${baseUrl}?${queryParams.toString()}`;

      // Redirect to the constructed URL
      window.location.href = fullUrl;
    }
  };

  const handlePieClick = (event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      const category = filteredChartData.jobCountByCategory[elementIndex].category;

      // Construct the URL with query parameters
      const baseUrl = `/dashboard`;
      const queryParams = new URLSearchParams();

      // Append the category to the query parameters
      queryParams.append("category", category);

      // Append other selected filters
      if (selectedDate) queryParams.append("datePosted", selectedDate);
      if (selectedLocation) queryParams.append("location", selectedLocation);
      if (selectedJobType) queryParams.append("jobType", selectedJobType);
      if (selectedSite) queryParams.append("site", selectedSite);

      const fullUrl = `${baseUrl}?${queryParams.toString()}`;

      // Redirect to the constructed URL
      window.location.href = fullUrl;
    }
  };

  // Prepare chart data and options
  const prepareChartData = (
    data: { category: string; count: number }[],
    labelKey: string,
    dataKey: string
  ) => ({
    labels: data.map((item) => item[labelKey as keyof typeof item]),
    datasets: [
      {
        label: dataKey,
        data: data.map((item) => item[dataKey as keyof typeof item]),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
    onClick: handleBarClick,
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Chart.js Chart",
      },
    },
  };

  const preparePieChartData = (
    data: { category: string; count: number }[],
    labelKey: string,
    dataKey: string
  ) => ({
    labels: data.map((item) => item[labelKey as keyof typeof item]),
    datasets: [
      {
        label: dataKey,
        data: data.map((item) => item[dataKey as keyof typeof item]),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
      },
    ],
    onClick: handlePieClick,
  });
  return (
    <div className="analytics-page">
      <div className="p-8 space-y-12">

        <div className="filters">
          <select onChange={(e) => setSelectedDate(e.target.value)}>
            <option value="">All Dates</option>
            {[...new Set(allJobs.map((job) => job.date_posted))].map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>

          <select onChange={(e) => setSelectedLocation(e.target.value)}>
            <option value="">All Locations</option>
            {[...new Set(allJobs.map((job) => job.location))].map(
              (location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              )
            )}
          </select>

          <select onChange={(e) => setSelectedJobType(e.target.value)}>
            <option value="">All Job Types</option>
            {[...new Set(allJobs.map((job) => job.job_type))].map((jobType) => (
              <option key={jobType} value={jobType}>
                {jobType}
              </option>
            ))}
          </select>

          <select onChange={(e) => setSelectedSite(e.target.value)}>
            <option value="">All Sites</option>
            {[...new Set(allJobs.map((job) => job.site))].map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: "100%", height: "400px" }}>
          <Bar
            data={prepareChartData(
              filteredChartData.jobCountByCategory,
              "category",
              "count"
            )}
            options={{
              ...options,
              indexAxis: "y",
              plugins: {
                ...options.plugins,
                title: { display: true, text: "Job Count by Category" },
              },
              onClick: handleBarClick,
            }}
          />
        </div>

        <div
          className="bg-white p-6 rounded-2xl shadow-md"
          style={{ width: "50%", margin: "0 auto" }}
        >
          <h2 className="text-xl font-semibold mb-2">Jobs by Category</h2>
          <Pie
            data={preparePieChartData(
              filteredChartData.jobCountByCategory,
              "category",
              "count"
            )}
            options={{
              ...options,
              onClick: handlePieClick,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default JobsByCategoryChart;
