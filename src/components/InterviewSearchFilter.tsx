"use client";

import { useState, useCallback } from "react";
import { Search, ChevronDown } from "lucide-react";

type SortOption = "newest" | "oldest" | "most_shared" | "most_liked";

type InterviewSearchFilterProps = {
  tags: string[];
  onSearch: (searchTerm: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSortChange: (sortBy: SortOption) => void;
};

export function InterviewSearchFilter({
  tags,
  onSearch,
  onTagsChange,
  onSortChange
}: InterviewSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      onSearch(term);
    },
    [onSearch]
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      const updated = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag];
      setSelectedTags(updated);
      onTagsChange(updated);
    },
    [selectedTags, onTagsChange]
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as SortOption;
      setSortBy(value);
      onSortChange(value);
    },
    [onSortChange]
  );

  const handleClearTags = useCallback(() => {
    setSelectedTags([]);
    onTagsChange([]);
  }, [onTagsChange]);

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

      <div className="filter-controls">
        <div className="tag-filter">
          <button
            className="tag-filter-button"
            onClick={() => setShowTagDropdown(!showTagDropdown)}
            aria-expanded={showTagDropdown}
            aria-label="Filter op tags"
          >
            Tags
            <ChevronDown size={16} aria-hidden />
          </button>
          {showTagDropdown && (
            <div className="tag-dropdown">
              <div className="tag-dropdown-header">
                <span>Selecteer tags</span>
                {selectedTags.length > 0 && (
                  <button className="tag-clear-button" onClick={handleClearTags}>
                    Wis alles
                  </button>
                )}
              </div>
              <div className="tag-list">
                {tags.map((tag) => (
                  <label key={tag} className="tag-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {selectedTags.length > 0 && <span className="tag-count">{selectedTags.length}</span>}
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
        </div>
      </div>
    </div>
  );
}
