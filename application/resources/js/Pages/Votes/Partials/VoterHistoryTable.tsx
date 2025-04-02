import React, { useEffect, useState, useRef } from 'react';
import VoterHistoryData = App.DataTransferObjects.VoterHistoryData;
import FundData = App.DataTransferObjects.FundData;
import SearchControls from '@/Components/atoms/SearchControls';
import { SearchParams } from '../../../../types/search-params';
import { useTranslation } from 'react-i18next';
import VoteSortOptions from '@/lib/VoteSortOptions';
import VoteFilters from './VoteFilters';
import { useFilterContext } from '@/Context/FiltersContext';
import { VoteEnums } from '@/enums/vote-search-enums';
import { router } from '@inertiajs/react';
import _ from 'lodash';

interface VoterHistoryTableProps {
  voterHistories: VoterHistoryData[];
  filters: SearchParams;
}

const VoterHistoryTable: React.FC<VoterHistoryTableProps> = ({ voterHistories }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = React.useState(false);
  const { filters } = useFilterContext();
  const [isLoading, setIsLoading] = useState(false);
  const prevFiltersRef = useRef('');
  const isInitialRender = useRef(true);
  
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      prevFiltersRef.current = JSON.stringify(filters);
      return;
    }
    
    if (filters.length === 0) {
      return;
    }
    
    // Only process filters that are not related to the secondary search
    // We're handling that separately in the Index component
    const stakeAddressFilters = filters.filter(filter => 
      filter.param !== 'secondary_search'
    );
    
    if (stakeAddressFilters.length === 0) {
      return;
    }
    
    const currentFiltersStr = JSON.stringify(stakeAddressFilters);
    if (prevFiltersRef.current === currentFiltersStr) {
      return;
    }
    
    prevFiltersRef.current = currentFiltersStr;
    setIsLoading(true);
    
    const params: Record<string, any> = {};
    stakeAddressFilters.forEach(filter => {
      if (filter.param && filter.value !== undefined && filter.value !== '') {
        params[filter.param] = filter.value;
      }
    });

    router.get(window.location.pathname, params, {
      preserveScroll: true,
      only: ['voterHistories', 'filters'],
      onFinish: () => {
        setIsLoading(false);
      }
    });
  }, [filters]);

  const safelyGetNestedValue = (obj: any, path: string, defaultValue: any = 'N/A') => {
    try {
      const result = path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
      return result !== null && result !== undefined ? result : defaultValue;
    } catch (e) {
      console.error(`Error accessing path ${path}:`, e);
      return defaultValue;
    }
  };

  const formatVotingPower = (value: any): string => {
    if (value === undefined || value === null) return '0.0';
    
    try {
      const numValue = Number(value);
      return Number.isNaN(numValue) ? '0.0' : numValue.toFixed(2);
    } catch (e) {
      console.error('Error formatting voting power:', e);
      return '0.0';
    }
  };

  return (
    <div className="overflow-x-auto">
      <section className="container">
        {/* Use SearchControls without the searchProps parameter */}
        <SearchControls
          onFiltersToggle={setShowFilters}
          sortOptions={VoteSortOptions()}
          searchPlaceholder={t('searchBar.placeholder', 'Search by Fragment ID, Caster, or Raw Fragment')}
        />
      </section>
      <section
        className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
          showFilters ? 'max-h-[500px]' : 'max-h-0'
        }`}
      >
        <VoteFilters/>
      </section>
      
      {isLoading && (
        <div className="w-full text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}
      
      <table className="min-w-full bg-background">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Fund</th>
            <th className="py-2 px-4 border-b text-left">Stake Address</th>
            <th className="py-2 px-4 border-b text-left">Fragment ID</th>
            <th className="py-2 px-4 border-b text-left">Caster</th>
            <th className="py-2 px-4 border-b text-left">Timestamp</th>
            <th className="py-2 px-4 border-b text-left">Choice</th>
            <th className="py-2 px-4 border-b text-left">Voting Power</th>
            <th className="py-2 px-4 border-b text-left">Raw Fragment</th>
          </tr>
        </thead>
        <tbody>
          {!isLoading && voterHistories && voterHistories.length > 0 ? (
            voterHistories.map((history, index) => (
              <tr key={safelyGetNestedValue(history, 'fragment_id', index)} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-2 px-4 border-b">
                  {typeof history.fund === 'string' 
                      ? history.fund 
                      : history.fund && typeof history.fund === 'object' && 'title' in history.fund
                      ? history.fund.title
                      : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  {history.stake_address ? 
                    `${history.stake_address.substring(0, 10)}...` : 
                    'N/A'}
                </td>
                <td className="py-2 px-4 border-b">{safelyGetNestedValue(history, 'fragment_id')}</td>
                <td className="py-2 px-4 border-b">{safelyGetNestedValue(history, 'caster')}</td>
                <td className="py-2 px-4 border-b">{safelyGetNestedValue(history, 'time')}</td>
                <td className="py-2 px-4 border-b">{safelyGetNestedValue(history, 'choice')}</td>
                <td className="py-2 px-4 border-b">{formatVotingPower(history.voting_power)}</td>
                <td className="py-2 px-4 border-b">{safelyGetNestedValue(history, 'raw_fragment')}</td>
              </tr>
            ))
          ) : !isLoading && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-gray-500">
                {t('common.noResults', 'No results found')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VoterHistoryTable;
