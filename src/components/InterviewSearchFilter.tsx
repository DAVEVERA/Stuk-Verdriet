"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

type SortOption = "newest" | "oldest" | "most_shared" | "most_liked";

type InterviewSearchFilterProps = {
  onSearch: (searchTerm: string) => void;
  onSortChange: (sortBy: SortOption) => void;
};

export function InterviewSearchFilter({ onSearch, onSortChange }: InterviewSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as SortOption;
    setSortBy(value);
    onSortChange(value);
  };

  return (
    <div className="interview-search-filter">
      <div className="search-box">
        <Search size={18} aria-hidden className="search-icon" />
        <input
          type="text"
          placeholder="Zoek interviews..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Zoek interviews"
        />
      </div>

      <div className="sort-filter">
        <label htmlFor="sort-select" className="sr-only">
          Sorteer interviews
        </label>
        <select id="sort-select" value={sortBy} onChange={handleSortChange} className="sort-select">
          <option value="newest">Nieuwste</option>
          <option value="oldest">Oudste</option>
          <option value="most_shared">Meest gedeeld</option>
          <option value="most_liked">Meeste hartjes</option>
        </select>
        <ChevronDown size={20} aria-hidden className="sort-chevron" />
      </div>
    </div>
  );
}
