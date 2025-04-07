import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

interface JobFiltersProps {
  onFilterChange: (filters: {
    search: string;
    jobType: string;
    location: string;
    category: string;
    datePosted: string;
    site: string;
  }) => void;
  categories: string[];
  locations: string[];
  jobTypes: string[];
  sites: string[];
  dateOptions: string[];
}

interface Filters {
  search: string;
  jobType: string;
  location: string;
  category: string;
  datePosted: string;
  site: string;
}

export function JobFilters({ onFilterChange, categories, locations, jobTypes, sites, dateOptions }: JobFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    jobType: "",
    location: "",
    category: "",
    datePosted: "",
    site: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleClearFilters = () => {
    const clearedFilters = {
      search: "",
      jobType: "",
      location: "",
      category: "",
      datePosted: "",
      site: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    const updatedFilters = {
      ...filters,
      [filterName]: value === "all" ? "" : value,
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Filters</h2>
        <Button
          variant="outline"
          className={`border-slate-700 text-slate-300 ${showFilters ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          onClick={() => setShowFilters(prevState => !prevState)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {showFilters && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by job title or company..."
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                value={filters.search}
                onChange={(e) =>
                  handleFilterChange("search", e.target.value)
                }
              />
            </div>
            <Button
              variant="outline"
              className="border-slate-700 text-white bg-red-600 hover:bg-red-700"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Job Type</label>
              <Select
                value={filters.jobType || "all"}
                onValueChange={(value) =>
                  handleFilterChange("jobType", value)
                }
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Location</label>
              <Select
                value={filters.location || "all"}
                onValueChange={(value) =>
                  handleFilterChange("location", value)
                }
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <Select
                value={filters.category || "all"}
                onValueChange={(value) =>
                  handleFilterChange("category", value)
                }
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Date Posted</label>
              <Select
                value={filters.datePosted || "all"}
                onValueChange={(value) =>
                  handleFilterChange("datePosted", value)
                }
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Date Posted" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {dateOptions.map((date) => (
                    <SelectItem key={date} value={date}>{date}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Site</label>
              <Select
                value={filters.site || "all"}
                onValueChange={(value) =>
                  handleFilterChange("site", value)
                }
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site} value={site}>{site}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
