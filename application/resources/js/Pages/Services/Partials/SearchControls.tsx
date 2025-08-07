import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/Components/atoms/Button';
import { ServiceSearchBar } from './ServiceSearchBar';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface SearchControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  onFiltersToggle: (show: boolean) => void;
  showFilters: boolean;
  viewType?: 'all' | 'user';
}

export default function SearchControls({
  search,
  onSearchChange,
  onFiltersToggle,
  showFilters,
  viewType = 'all'
}: SearchControlsProps) {
    const { t } = useLaravelReactI18n();
  const [searchQuery, setSearchQuery] = useState(search);

  const shouldShowFilters = viewType === 'all';

  useEffect(() => {
    if (search !== searchQuery) {
      setSearchQuery(search);
    }
  }, [search]);

  const handleSearch = useCallback((searchValue: string) => {
    setSearchQuery(searchValue);
    onSearchChange(searchValue);
  }, [onSearchChange]);

  const toggleFilters = useCallback(() => {
    onFiltersToggle(!showFilters);
  }, [showFilters, onFiltersToggle]);

  return (
    <div className="w-full" data-testid="services-search-controls">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <ServiceSearchBar
            border="border-gray-200"
            handleSearch={handleSearch}
            autoFocus={false}
            showRingOnFocus={true}
            value={searchQuery}
            placeholder={"Search"}
            data-testid="services-search-input"
          />
        </div>

        {shouldShowFilters && (
          <Button
            className={`h-10 px-6 border border-gray-200 bg-background flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg border ${
              showFilters
                ? 'border-accent-blue text-primary'
                : 'hover:bg-background-lighter text-gray-persist'
            }`}
            onClick={toggleFilters}
            ariaLabel={'filters'}
            dataTestId="filters-toggle-button"
          >
            <FilterLinesIcon className="w-5 h-4" />
            <span className="whitespace-nowrap">{t('filters')}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
