"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { JobForCharts } from "../page";
import { ChartEvent, ActiveElement } from 'chart.js';

interface LocationBasedChartsProps {
  allJobs: JobForCharts[];
}

const LocationBasedCharts = ({ allJobs }: LocationBasedChartsProps) => {
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);

  // Process data for different charts
  const processData = useCallback((jobs: JobForCharts[]) => {
    // Filter jobs based on selected filters and exclude 'Unknown' locations
    const filteredJobs = jobs.filter((job) => {
      const isDateMatch = selectedStartDate ? job.date_posted === selectedStartDate : true;

      return (
        (!selectedJobType || job.job_type === selectedJobType) &&
        (!selectedSite || job.site === selectedSite) &&
        (!selectedCategory || job.category === selectedCategory) &&
        job.location !== "Unknown" &&
        isDateMatch
      );
    });

    // Count jobs by location, excluding 'Unknown'
    const jobCountByLocation = filteredJobs.reduce((acc, job) => {
      const location = job.location;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort locations by job count and take top 10
    const topLocations = Object.entries(jobCountByLocation)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Prepare data for hierarchical view, excluding 'Unknown' categories
    const locationCategoryData = topLocations.map(([location, count]) => {
      const categoriesInLocation = filteredJobs
        .filter((job) => job.location === location)
        .reduce((acc, job) => {
          const category = job.category;
          if (category !== "Unknown") {
            acc[category] = (acc[category] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

      return {
        location,
        totalCount: count,
        categories: Object.entries(categoriesInLocation)
          .sort((a, b) => b[1] - a[1])
          .map(([category, count]) => ({
            category,
            count
          }))
      };
    });

    return {
      topLocations,
      locationCategoryData
    };
  }, [selectedJobType, selectedSite, selectedCategory, selectedStartDate]);

  const chartData = useMemo(() => processData(allJobs), [
    allJobs,
    processData
  ]);

  // Prepare chart data for bar chart (job count by location)
  const barChartData = {
    labels: chartData.topLocations.map(([location]) => location),
    datasets: [
      {
        label: "Number of Jobs by Location",
        data: chartData.topLocations.map(([, count]) => count),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }
    ]
  };

  // Prepare chart data for hierarchical view
  const hierarchicalChartData = {
    labels: chartData.locationCategoryData.map(item => item.location),
    datasets: chartData.locationCategoryData.length > 0 ? chartData.locationCategoryData[0].categories.map((_, index) => {
      const colors = [
        "rgba(255, 99, 132, 0.5)",
        "rgba(54, 162, 235, 0.5)",
        "rgba(255, 206, 86, 0.5)",
        "rgba(75, 192, 192, 0.5)",
        "rgba(153, 102, 255, 0.5)",
        "rgba(255, 159, 64, 0.5)",
        "rgba(199, 199, 199, 0.5)",
        "rgba(83, 102, 255, 0.5)",
        "rgba(255, 99, 255, 0.5)",
        "rgba(255, 159, 199, 0.5)"
      ];
      
      return {
        label: chartData.locationCategoryData[0].categories[index]?.category || `Category ${index + 1}`,
        data: chartData.locationCategoryData.map(item => 
          item.categories[index]?.count || 0
        ),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace("0.5", "1"),
        borderWidth: 1
      };
    }) : []
  };

  // Function to handle chart clicks
  const handleChartClick = (event: ChartEvent, elements: ActiveElement[], chartType: string) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      const datasetIndex = elements[0].datasetIndex;
      const location = chartData.topLocations[elementIndex][0];
      let category = "";

      if (chartType === "category") {
        category = chartData.locationCategoryData[elementIndex].categories[datasetIndex]?.category || "";
      }

      // Construct the URL with query parameters
      const baseUrl = `/dashboard`;
      const queryParams = new URLSearchParams();

      // Append the location to the query parameters
      queryParams.append("location", location);

      // Append the category if applicable
      if (category) queryParams.append("category", category);

      // Append other selected filters
      if (selectedStartDate) queryParams.append("datePosted", selectedStartDate);
      if (selectedJobType) queryParams.append("jobType", selectedJobType);
      if (selectedSite) queryParams.append("site", selectedSite);

      const fullUrl = `${baseUrl}?${queryParams.toString()}`;

      // Redirect to the constructed URL
      window.location.href = fullUrl;
    }
  };

  // Add onClick handlers to the chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Job Distribution by Location"
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    onClick: (event: ChartEvent, elements: ActiveElement[]) => handleChartClick(event, elements, "location")
  };

  const hierarchicalChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Job Categories by Location"
      }
    },
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        beginAtZero: true
      }
    },
    onClick: (event: ChartEvent, elements: ActiveElement[]) => handleChartClick(event, elements, "category")
  };

  return (
    <div className="location-based-charts p-8 space-y-12">
      <div className="filters grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-slate-400 mb-1">Date Posted</label>
          <select
            className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
            onChange={(e) => setSelectedStartDate(e.target.value || null)}
            value={selectedStartDate || ""}
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
            {[...new Set(allJobs.map((job) => job.category))].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Number of Jobs by Location
          </h3>
          <div style={{ height: "400px" }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Job Categories by Location
          </h3>
          <div style={{ height: "400px" }}>
            <Bar data={hierarchicalChartData} options={hierarchicalChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationBasedCharts; 