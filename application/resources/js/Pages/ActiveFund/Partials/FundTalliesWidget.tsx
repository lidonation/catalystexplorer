import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Paginator from '@/Components/Paginator';
import SearchControls from '@/Components/atoms/SearchControls';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { currency } from '@/utils/currency';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import VoterData = App.DataTransferObjects.VoterData;
import ProposalData = App.DataTransferObjects.ProposalData;
import FundData = App.DataTransferObjects.FundData;

interface VotingStatsItem extends VoterData {
    fund_ranking?: number;
    latest_proposal?: ProposalData;
}

interface FundTalliesWidgetProps {
    tallies?: PaginatedData<VotingStatsItem[]> & { total_votes_cast?: number };
    showPagination?: boolean;
    maxHeight?: string;
    customTitle?: string;
    limit?: number;
    lastUpdated?: string;
    filters?: Partial<SearchParams>;
    routerOptions?: Record<string, any>;
    showFilters?: boolean;
}

const TableHeader: React.FC<{ label: string; isLastColumn?: boolean }> = ({
    label,
    isLastColumn,
}) => (
    <th
        className={`text-gray-persist bg-background-lighter border-content-light ${
            isLastColumn ? '' : 'border-r'
        } border-b px-4 py-3 text-left font-medium`}
    >
        {label}
    </th>
);

const TableCell: React.FC<{
    children: React.ReactNode;
    className?: string;
    isLastColumn?: boolean;
}> = ({ children, className = '', isLastColumn }) => (
    <td
        className={`text-darker bg-background border-content-light ${
            isLastColumn ? '' : 'border-r'
        } border-b px-4 py-4 ${className}`}
    >
        {children}
    </td>
);

// Loading skeleton component
const TableSkeleton: React.FC<{ rows: number }> = ({ rows }) => (
    <div className="animate-pulse">
        <table className="w-max min-w-full">
            <thead className="bg-background-lighter whitespace-nowrap">
                <tr>
                    <TableHeader label="" />
                    <TableHeader label="" />
                    <TableHeader label="" isLastColumn />
                </tr>
            </thead>
            <tbody className="whitespace-nowrap">
                {Array.from({ length: rows }).map((_, index) => (
                    <tr key={index}>
                        <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </TableCell>
                        <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </TableCell>
                        <TableCell isLastColumn>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </TableCell>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const FundTalliesWidgetComponent: React.FC<FundTalliesWidgetProps> = ({
    tallies,
    showPagination = false,
    customTitle,
    limit = 10,
    showFilters = false,
}) => {
    const { t } = useLaravelReactI18n();
    const { setFilters, getFilter } = useFilterContext();
    const [sortBy, setSortBy] = useState<'votes' | 'ranking' | 'proposal' | 'budget'>('ranking');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Refs for scroll anchoring
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);
    
    // Track previous data to detect changes
    const prevDataRef = useRef<any>(null);

    const searchTerm = (getFilter(ParamsEnum.QUERY) || '') as string;
    const campaignFilter = (getFilter(ParamsEnum.CAMPAIGNS) || []) as string[];

    // Handle loading states and scroll preservation
    useEffect(() => {
        if (tallies && prevDataRef.current) {
            // If data is changing, briefly show loading
            if (JSON.stringify(prevDataRef.current) !== JSON.stringify(tallies)) {
                setIsLoading(true);
                
                // Use RAF to ensure smooth transition
                requestAnimationFrame(() => {
                    setIsLoading(false);
                });
            }
        }
        prevDataRef.current = tallies;
    }, [tallies]);

    // Preserve scroll position during updates
    useEffect(() => {
        if (showPagination && widgetRef.current && !isLoading) {
            // Scroll the widget into view to prevent page jumping
            const rect = widgetRef.current.getBoundingClientRect();
            const isVisible = rect.top >= 0 && rect.top <= window.innerHeight;
            
            if (!isVisible) {
                widgetRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    }, [tallies?.current_page, searchTerm, showPagination, isLoading]);

    const formatBudget = (proposal?: ProposalData, fund?: FundData): string => {
        if (!proposal || !proposal.amount_requested) return 'N/A';

        const preferredCurrency = fund?.currency || proposal.currency;

        const amountRequested = Number(proposal.amount_requested);
        if (isNaN(amountRequested)) return 'N/A';

        if (preferredCurrency === 'USD') {
            const result = currency(amountRequested, 2, 'USD');
            return String(result);
        }

        const amount = amountRequested > 1000000
            ? amountRequested / 1000000
            : amountRequested;

        const currencyCode = String(preferredCurrency || 'ADA');
        const result = currency(amount, 2, currencyCode);
        return String(result);
    };

    const shouldShowNoRecords = () => {
        return !tallies?.data || tallies.data.length === 0;
    };

    const filteredData = useMemo(() => {
        // For paginated data, return the server-filtered data as-is
        // The search filtering is handled server-side via the FiltersContext
        if (showPagination) {
            return tallies?.data || [];
        }

        // For non-paginated data, apply client-side filtering
        let filtered = tallies?.data || [];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(stat =>
                stat.cat_id?.toLowerCase().includes(term) ||
                stat.latest_proposal?.title?.toLowerCase().includes(term) ||
                stat.latest_proposal?.campaign?.title?.toLowerCase().includes(term) ||
                stat.stake_pub?.toLowerCase().includes(term)
            );
        }

        if (campaignFilter.length > 0) {
            filtered = filtered.filter(stat =>
                stat.latest_proposal?.campaign?.id &&
                campaignFilter.includes(stat.latest_proposal.campaign.id)
            );
        }

        filtered = [...filtered].sort((a, b) => {
            let aValue: string | number, bValue: string | number;

            switch (sortBy) {
                case 'votes':
                    aValue = a.votes_count || 0;
                    bValue = b.votes_count || 0;
                    break;
                case 'ranking':
                    aValue = a.fund_ranking || 999999;
                    bValue = b.fund_ranking || 999999;
                    break;
                case 'proposal':
                    aValue = a.latest_proposal?.title || 'zzz';
                    bValue = b.latest_proposal?.title || 'zzz';
                    break;
                case 'budget':
                    aValue = a.latest_proposal?.amount_requested || 0;
                    bValue = b.latest_proposal?.amount_requested || 0;
                    break;
                default:
                    return 0;
            }

            // Handle string comparisons
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
            }

            const aString = String(aValue);
            const bString = String(bValue);
            return sortOrder === 'asc'
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });

        return filtered;
    }, [tallies?.data, searchTerm, campaignFilter, sortBy, sortOrder, showPagination]);

    const displayData = showPagination
        ? filteredData  // Already server-filtered when showPagination=true
        : filteredData.slice(0, limit);

    return (
        <div 
            ref={widgetRef}
            className="bg-background w-full rounded-lg border border-content-light shadow-sm"
        >
            <div className="m-8 border-b border-content-light px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                        <Title className="font-bold text-xl" level="2">
                            {customTitle || t('activeFund.votingStats.title')}
                        </Title>
                        <Paragraph className="text-gray-persist text-sm mt-1">
                            {t('activeFund.votingStats.description')}
                        </Paragraph>
                        <Paragraph className="text-gray-400 text-xs mt-2">
                            ({t('activeFund.votingStats.updatedMonthsAgo')})
                        </Paragraph>
                    </div>
                    <div className="p-4 bg-background rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-content-light inline-flex flex-col justify-start items-start gap-5">
                        <div className="flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch inline-flex justify-between items-center flex-wrap content-center">
                                <div className="text-center justify-start text-4xl font-bold">
                                    {tallies?.total_votes_cast ? tallies.total_votes_cast.toLocaleString() : '0'}
                                </div>
                            </div>
                            <div className="self-stretch text-center text-gray-persist justify-start text-sm font-normal">
                                {t('activeFund.votingStats.totalVotesCast')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showFilters && (
                <div className="m-8 border-b border-content-light">
                    <SearchControls
                        onFiltersToggle={setFiltersVisible}
                        searchPlaceholder={t('activeFund.votingStats.searchPlaceholder')}
                        withFilters={true}
                        withActiveTags={true}
                    />
                </div>
            )}

            {showFilters && filtersVisible && (
                <div className="border-b px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-content">
                                {t('proposals.filters.campaigns')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {shouldShowNoRecords() && !isLoading ? (
                <div className="flex w-full flex-col items-center justify-center px-4 py-8">
                    <Paragraph className="text-gray-persist">
                        {t('activeFund.noVotingStatsAvailable')}
                    </Paragraph>
                </div>
            ) : (
                <div 
                    ref={tableContainerRef}
                    className={`m-8 bg-background rounded-xl shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] outline outline-1 outline-offset-[-1px] outline-content-light flex flex-col justify-start items-start overflow-x-auto overflow-hidden`}
                    style={{
                        // Maintain consistent height during loading to prevent layout shifts
                        minHeight: showPagination ? '400px' : 'auto'
                    }}
                >
                    {isLoading ? (
                        <div className="w-full">
                            <TableSkeleton rows={Math.min(displayData.length || 10, 10)} />
                        </div>
                    ) : (
                        <table className="w-max min-w-full">
                            <thead className="bg-background-lighter whitespace-nowrap">
                                <tr>
                                    <TableHeader label={t('activeFund.votingStats.votesCast')} />
                                    <TableHeader label={t('activeFund.votingStats.proposal')} />
                                    <TableHeader label={t('activeFund.votingStats.budget')} isLastColumn />
                                </tr>
                            </thead>
                            <tbody className="whitespace-nowrap">
                                {displayData.map((stat, index) => (
                                    <tr key={stat.id || index}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="text-content font-normal">
                                                    {stat.votes_count || 0}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-auto flex gap-2">
                                            {stat.latest_proposal?.title}
                                        </TableCell>
                                        <TableCell isLastColumn>
                                            <span className="font-normal">
                                                {formatBudget(stat.latest_proposal, stat.latest_fund)}
                                            </span>
                                        </TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {showPagination && tallies && tallies.data && tallies.data.length > 0 && (
                        <div className="border-t w-full px-4 py-4 overflow-x-hidden">
                            <Paginator
                                pagination={tallies}
                                linkProps={{
                                    preserveState: true,
                                    preserveScroll: true,
                                    only: ['tallies', 'filters'],
                                    replace: true
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const FundTalliesWidget: React.FC<FundTalliesWidgetProps> = (props) => {
    const { filters = {}, routerOptions = {} } = props;

    return (
        <FiltersProvider
            defaultFilters={filters as SearchParams}
            routerOptions={{
                preserveState: true,
                preserveScroll: true,
                only: ['tallies'],
                ...routerOptions
            }}
        >
            <FundTalliesWidgetComponent {...props} />
        </FiltersProvider>
    );
};

export default FundTalliesWidget;