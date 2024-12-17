import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Filters from '@/Components/svgs/Filters';

interface FiltersProps {
  initialFilters: string[];
}

const ActiveProposalFilters: React.FC<FiltersProps> = ({ initialFilters }) => {
  const [filters, setFilters] = useState<string[]>(initialFilters);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const { t } = useTranslation();

  const removeFilter = (filterToRemove: string) => {
    setFilters(filters.filter((filter) => filter !== filterToRemove));
  };

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  return (
    <div className="w-full">
      <div className="bg-background borderRadius border rounded-md mr-4 flex items-center px-2 py-1 h-9">

        <Filters />
        <button onClick={toggleFilters} className="px-2 flex items-center">
          {t('proposals.filters.filters')}
          {filters.length > 0 && (
            <span className="ml-2 text-sm text-gray-400">
              ({filters.length})
            </span>
          )}
        </button>

      </div>
      {showFilters && (
        <div className="flex mt-2 flex-wrap">
          {filters.map((filter, index) => (
            <div
              className="flex items-center h-9 justify-between border rounded-md !bg-background px-2 py-1.5 text-sm whitespace-nowrap mr-2"
              key={index}
            >
              <p className="mr-1 whitespace-nowrap">{filter}</p>
              <button
                className="remove-button"
                onClick={() => removeFilter(filter)}
                aria-label={`Remove ${filter}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveProposalFilters;
