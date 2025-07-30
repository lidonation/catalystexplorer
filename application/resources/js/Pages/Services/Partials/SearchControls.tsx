import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/Components/atoms/Button';
import { ServiceSearchBar } from './ServiceSearchBar';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';

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
  viewType = 'all' // Default to 'all' for backward compatibility
}: SearchControlsProps) {
  const { t } = useTranslation();
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
    <div className="container mx-auto flex w-full flex-col gap-3 px-0 py-3">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <div className="w-full">
          <ServiceSearchBar
            border="border-gray-200"
            handleSearch={handleSearch}
            autoFocus={false}
            showRingOnFocus={true}
            value={searchQuery}
            placeholder={t('services.search_placeholder') || "Search services..."}
          />
        </div>
        {shouldShowFilters && (
          <div className="sm:w-auto">
            <Button
              className={`border-input bg-background flex w-full cursor-pointer flex-row items-center justify-center gap-2 rounded-lg border px-3 py-1.5 shadow-md sm:w-auto ${
                showFilters
                  ? 'border-accent-blue text-primary ring-offset-background ring-1'
                  : 'hover:bg-background-lighter text-gray-persist'
              }`}
              onClick={toggleFilters}
              ariaLabel={t('filters')}
            >
              <FilterLinesIcon className="size-6" />
              <span>{t('filters')}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
