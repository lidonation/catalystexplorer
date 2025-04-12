import React, { useEffect, useState, useRef, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import _ from 'lodash';
import VoteFilters from './VoteFilters';
import ToolTipHover from '@/Components/ToolTipHover';
import CopyIcon from '@/Components/svgs/CopyIcon';
import Paginator from '@/Components/Paginator';
import SecondarySearchControls from '@/Components/atoms/SecondarySearchControls';
import VoteHistoryTableLoader from './VoterHistoryTableLoader';
import Title from '@/Components/atoms/Title';
import VoteSortOptions from '@/lib/VoteSortOptions';
import { useFilterContext } from '@/Context/FiltersContext';
import { VoteEnums } from '@/enums/vote-search-enums';
import { SearchParams } from '../../../../types/search-params';
import { PaginatedData } from '../../../../types/paginated-data';
import VoterHistoryData = App.DataTransferObjects.VoterHistoryData;
import Button from '@/Components/atoms/Button';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import Paragraph from '@/Components/atoms/Paragraph';

interface VoterHistoryTableProps {
  voterHistories?: PaginatedData<VoterHistoryData[]>;
  filters: SearchParams;
  showFilters?: boolean;
  setShowFilters?: Dispatch<SetStateAction<boolean>>;
}

const VoterHistoryTable: React.FC<VoterHistoryTableProps> = ({ 
  voterHistories, 
  showFilters = false, 
  setShowFilters = () => {} 
}) => {
  const { t } = useTranslation();
  const { filters, setFilters } = useFilterContext();
  const [isLoading, setIsLoading] = useState(false);
  const prevFiltersRef = useRef('');
  const isInitialRender = useRef(true);
  const [hoveredCell, setHoveredCell] = useState<{rowIndex: number, col: string} | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  
  const [internalShowFilters, setInternalShowFilters] = useState(false);
  
  const handleFiltersToggle: Dispatch<SetStateAction<boolean>> = 
    setShowFilters !== (() => {}) ? setShowFilters : setInternalShowFilters;
  
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      prevFiltersRef.current = JSON.stringify(filters);
      return;
    }
    
    if (filters.length === 0) return;
    
    const nonPrimaryFilters = filters.filter(filter => 
      filter.param !== VoteEnums.QUERY
    );
    
    if (nonPrimaryFilters.length === 0) return;
    
    const currentFiltersStr = JSON.stringify(nonPrimaryFilters);
    if (prevFiltersRef.current === currentFiltersStr) return;
    
    prevFiltersRef.current = currentFiltersStr;
    setIsLoading(true);
    setHasSearched(true);
    
    const url = new URL(window.location.href);
    const params: Record<string, any> = {};
    
    for (const [key, value] of url.searchParams.entries()) {
      if (value) params[key] = value;
    }
    
    const primarySearch = url.searchParams.get(VoteEnums.QUERY);
    if (primarySearch) params[VoteEnums.QUERY] = primarySearch;
    
    nonPrimaryFilters.forEach(filter => {
      if (filter.param && filter.value !== undefined && filter.value !== '') {
        params[filter.param] = filter.value;
      }
    });
    
    router.get(window.location.pathname, params, {
      preserveScroll: true,
      preserveState: true,
      only: ['voterHistories', 'filters'],
      replace: true,
      onFinish: () => setIsLoading(false)
    });
  }, [filters]);

  const hasActiveFilters = () => {
    if (!filters || filters.length === 0) return false;
    
    return filters.some(filter => 
      filter.param === VoteEnums.QUERY || 
      filter.param === VoteEnums.SECONDARY_QUERY ||
      filter.value !== undefined && filter.value !== ''
    );
  };

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
    if (value === undefined || value === null) return '₳ 0';
    
    try {
      const numValue = Number(value);
      if (Number.isNaN(numValue)) return '₳ 0';
      
      const adaValue = numValue / 1000000;
      
      const formattedValue = Math.floor(adaValue).toLocaleString();
      
      return `₳ ${formattedValue}`;
    } catch (e) {
      console.error('Error formatting voting power:', e);
      return '₳ 0';
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleMouseEnter = (rowIndex: number, col: string) => {
    setHoveredCell({ rowIndex, col });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const truncateText = (text: string, maxLength: number = 10) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    
    const startChars = Math.ceil(maxLength / 2);
    const endChars = Math.floor(maxLength / 2);
    return `${text.substring(0, startChars)}...${text.substring(text.length - endChars)}`;
  };

  const getValueWithTooltip = (rowIndex: number, history: VoterHistoryData, col: string, value: string) => {
    const isHovered = hoveredCell && hoveredCell.rowIndex === rowIndex && hoveredCell.col === col;
    
    return (
      <div className="flex items-center justify-between relative w-full">
        <div className="flex-1 truncate cursor-pointer"
          onMouseEnter={() => handleMouseEnter(rowIndex, col)}
          onMouseLeave={handleMouseLeave}
        >
          {truncateText(value)}
        </div>
        
        {isHovered && value.length > 10 && (
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full -top-2 z-20">
            <ToolTipHover props={value} />
          </div>
        )}
        
        <Button 
          className="flex-shrink-0 text-gray-persist hover:text-primary focus:outline-none"
          onClick={() => copyToClipboard(value, `${rowIndex}-${col}`)}
        >
          <CopyIcon width={16} height={16} />
        </Button>
        
        {copiedField === `${rowIndex}-${col}` && (
          <span className="absolute -top-10 right-0 z-10 bg-content-success-light text-content-success-darker text-xs px-2 py-1 rounded">
            {t('copied')}
          </span>
        )}
      </div>
    );
  };

  const shouldShowNoRecords = () => {
    return !isLoading && 
           (hasSearched || hasActiveFilters()) && 
           (!voterHistories?.data || voterHistories.data.length === 0);
  };

  const sortOptionsList = VoteSortOptions();

  return (
    <div className="overflow-x-auto">
      <section className="container">
        <Title className='border-b border-dark-light pt-4 pb-4 font-bold' level='3'>{t('vote.votingHistory')}</Title>
        <SecondarySearchControls
          onFiltersToggle={handleFiltersToggle}
          sortOptions={sortOptionsList}
          searchPlaceholder={t('vote.searchPlaceholder')}
          searchParam={VoteEnums.SECONDARY_QUERY}
          searchLabel={t('vote.secondarySearch')}
        />
      </section>
      
      <section
        className={`container overflow-hidden transition-all duration-500 ease-in-out ${
          (showFilters || internalShowFilters) ? 'max-h-[500px] my-4' : 'max-h-0'
        }`}
      >
        <VoteFilters/>
      </section>
      
      {shouldShowNoRecords() && (
        <div className="bg-background flex w-full flex-col items-center justify-center rounded-lg px-4 py-8 mb-10">
            <RecordsNotFound />
            <Paragraph className="mt-4 text-center text-dark">
                {t('vote.noStakeAddressFound')}
            </Paragraph>
        </div>
      )}

      {(!shouldShowNoRecords() || isLoading) && (
        <div className='container mb-4'>
          <div className="w-full bg-background shadow-sm overflow-hidden rounded-lg border border-dark-light">
            <div className="overflow-x-auto">
              <table className="min-w-full w-max">
                <thead className="bg-background-lighter whitespace-nowrap">
                  <tr>
                    <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-gray-persist bg-background-lighter">{t('vote.table.fund')}</th>
                    <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-gray-persist">{t('vote.table.stakeAddress')}</th>
                    <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-gray-persist">{t('vote.table.fragmentId')}</th>
                    <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-gray-persist">{t('vote.table.caster')}</th>
                    <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-gray-persist">{t('vote.table.timestamp')}</th>
                    <th className="py-3 px-4 border-b border-r border-dark-light text-center font-medium text-gray-persist">{t('vote.table.choice')}</th>
                    <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-gray-persist">{t('vote.table.votingPower')}</th>
                    <th className="py-3 px-4 border-b border-dark-light text-left font-medium text-gray-persist">{t('vote.table.rawFragment')}</th>
                  </tr>
                </thead>
                <tbody className="whitespace-nowrap">
                  {!isLoading && voterHistories?.data && voterHistories.data.length > 0 && (
                    voterHistories.data.map((history, index) => (
                      <tr key={safelyGetNestedValue(history, 'fragment_id', index)}>
                        <td className="py-4 px-4 border-b border-r border-dark-light text-darker bg-background">
                          {typeof history.fund === 'string' 
                              ? history.fund 
                              : history.fund && typeof history.fund === 'object' && 'title' in history.fund
                              ? history.fund.title
                              : t('vote.notAvailable')}
                        </td>
                        <td className="py-4 px-4 border-b border-r border-dark-light text-darker w-40">
                          {history.stake_address ? 
                            getValueWithTooltip(index, history, 'stake_address', history.stake_address) : 
                            t('vote.notAvailable')}
                        </td>
                        <td className="py-4 px-4 border-b border-r border-dark-light text-darker w-40">
                          {getValueWithTooltip(index, history, 'fragment_id', safelyGetNestedValue(history, 'fragment_id'))}
                        </td>
                        <td className="py-4 px-4 border-b border-r border-dark-light text-darker w-40">
                          {getValueWithTooltip(index, history, 'caster', safelyGetNestedValue(history, 'caster'))}
                        </td>
                        <td className="py-4 px-4 border-b border-r border-dark-light text-content">
                          <div className="flex flex-col">
                            <span>{history.time}</span>
                            {/* For time ago */}
                            {/* <span className="text-xs text-gray-persist">
                              {history.time}
                            </span> */} 
                          </div>
                        </td>
                        <td className="py-4 px-4 border-b border-r text-center border-dark-light text-darker">
                          {typeof safelyGetNestedValue(history, 'choice') === 'number' 
                            ? safelyGetNestedValue(history, 'choice').toString() 
                            : safelyGetNestedValue(history, 'choice')}
                        </td>
                        <td className="py-4 px-4 border-b border-r border-dark-light text-content">
                          <div className="flex items-center">
                            <span>{formatVotingPower(history.voting_power)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 border-b border-dark-light text-darker w-40">
                          {getValueWithTooltip(index, history, 'raw_fragment', safelyGetNestedValue(history, 'raw_fragment'))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {!isLoading && voterHistories && voterHistories.data && voterHistories.data.length > 0 && (
              <div className="bg-background rounded-b-lg border-t border-dark-light p-2">
                <Paginator
                  pagination={voterHistories} 
                  linkProps={{
                    preserveScroll: true,
                    only: ['voterHistories', 'filters'],
                    replace: true,
                    onClick: (e) => {
                      const target = e.target as HTMLAnchorElement;
                      if (target.href && target.href.includes(VoteEnums.PAGE)) {
                        e.preventDefault();
                        const url = new URL(target.href);
                        const pageValue = url.searchParams.get(VoteEnums.PAGE);
                        if (pageValue) {
                          setFilters({
                            param: VoteEnums.PAGE,
                            value: parseInt(pageValue),
                            label: 'Current Page',
                            resetPageOnChange: false
                          });
                        }
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && <VoteHistoryTableLoader/>}
      
    </div>
  );
};

export default VoterHistoryTable;
