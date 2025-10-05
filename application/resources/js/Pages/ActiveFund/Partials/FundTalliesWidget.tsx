import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Paginator from '@/Components/Paginator';
import SearchControls from '@/Components/atoms/SearchControls';
import Selector from '@/Components/atoms/Selector';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { router, Link } from '@inertiajs/react';
import ArrowDownIcon from '@/Components/svgs/ArrowDownIcon';
import ArrowUpIcon from '@/Components/svgs/ArrowUpIcon';
import { formatDistanceToNow } from 'date-fns';
import VoterData = App.DataTransferObjects.VoterData;
import ProposalData = App.DataTransferObjects.ProposalData;
import FundData = App.DataTransferObjects.FundData;
import CatalystTallyData = App.DataTransferObjects.CatalystTallyData;

interface FundTalliesWidgetProps {
    tallies?: PaginatedData<CatalystTallyData[]> & { total_votes_cast?: number };
    showPagination?: boolean;
    maxHeight?: string;
    customTitle?: string;
    limit?: number;
    lastUpdated?: string;
    filters?: Partial<SearchParams>;
    routerOptions?: Record<string, any>;
    showFilters?: boolean;
    campaigns?: any[];
    funds?: any[];
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

const SortableTableHeader: React.FC<{
    label: string;
    isLastColumn?: boolean;
    sortDirection?: 'asc' | 'desc' | null;
    onSort?: () => void;
}> = ({ label, isLastColumn, sortDirection, onSort }) => (
    <th
        className={`text-gray-persist bg-background-lighter border-content-light ${
            isLastColumn ? '' : 'border-r'
        } border-b px-4 py-3 text-left font-medium`}
    >
        <div
            className="flex cursor-pointer items-center justify-start gap-1"
            onClick={onSort}
        >
            <span>{label}</span>
            <div className="flex-col gap-2">
                <ArrowUpIcon
                    width={10}
                    height={10}
                    className={
                        sortDirection === 'asc'
                            ? 'text-primary'
                            : 'text-gray-persist'
                    }
                />
                <ArrowDownIcon
                    width={10}
                    height={10}
                    className={
                        sortDirection === 'desc'
                            ? 'text-primary'
                            : 'text-gray-persist'
                    }
                />
            </div>
        </div>
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
                    <TableHeader label="" />
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
                        <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </TableCell>
                        <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </TableCell>
                        <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
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
    campaigns = [],
    funds = [],
    lastUpdated,
}) => {
    const { t } = useLaravelReactI18n();
    const { setFilters, getFilter } = useFilterContext();

    const fundOptions = useMemo(() => {
        const options = funds?.map((fund) => ({
            value: fund.id,
            label: fund.title || fund.label,
        })) || [];
        return options;
    }, [funds]);

    const [sortBy, setSortBy] = useState<'votes' | 'ranking' | 'proposal' | 'budget'>('ranking');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const tableContainerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);

    const prevDataRef = useRef<any>(null);

    const searchTerm = (getFilter(ParamsEnum.QUERY) || '') as string;
    const campaignFilter = (getFilter(ParamsEnum.CAMPAIGNS) || []) as string[];
    const fundFilter = (getFilter(ParamsEnum.FUNDS) || []) as string[];

    const currentSort = getFilter(ParamsEnum.SORTS) || null;
    const [sortField, sortDirection] = currentSort ? currentSort.split(':') : [null, null];

    const handleVotesSort = () => {
        let direction: 'asc' | 'desc' | null = 'asc';

        if (sortField === 'votes_count') {
            if (sortDirection === 'asc') {
                direction = 'desc';
            } else if (sortDirection === 'desc') {
                direction = null;
            } else {
                direction = 'asc';
            }
        }

        if (showPagination) {
            if (!direction) {
                const url = new URL(window.location.href);
                url.searchParams.delete(ParamsEnum.SORTS);

                router.get(url.pathname + url.search, {}, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });

                setFilters({
                    param: ParamsEnum.SORTS,
                    value: null,
                    label: 'Sort'
                });
            } else {
                setFilters({
                    param: ParamsEnum.SORTS,
                    value: `votes_count:${direction}`,
                    label: 'Sort'
                });
            }
        } else {
            if (!direction) {
                setSortBy('ranking');
                setSortOrder('asc');
            } else {
                setSortBy('votes');
                setSortOrder(direction);
            }
        }
    };

    const handleBudgetSort = () => {
        let direction: 'asc' | 'desc' | null = 'asc';

        if (sortField === 'amount_requested') {
            if (sortDirection === 'asc') {
                direction = 'desc';
            } else if (sortDirection === 'desc') {
                direction = null;
            } else {
                direction = 'asc';
            }
        }

        if (showPagination) {
            if (!direction) {
                const url = new URL(window.location.href);
                url.searchParams.delete(ParamsEnum.SORTS);

                router.get(url.pathname + url.search, {}, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });

                setFilters({
                    param: ParamsEnum.SORTS,
                    value: null,
                    label: 'Sort'
                });
            } else {
                setFilters({
                    param: ParamsEnum.SORTS,
                    value: `amount_requested:${direction}`,
                    label: 'Sort'
                });
            }
        } else {
            if (!direction) {
                setSortBy('ranking');
                setSortOrder('asc');
            } else {
                setSortBy('budget');
                setSortOrder(direction);
            }
        }
    };

    const getVotesSortDirection = (): 'asc' | 'desc' | null => {
        if (showPagination) {
            return sortField === 'votes_count' ? (sortDirection as 'asc' | 'desc' | null) : null;
        } else {
            return sortBy === 'votes' ? sortOrder : null;
        }
    };

    const getBudgetSortDirection = (): 'asc' | 'desc' | null => {
        if (showPagination) {
            return sortField === 'amount_requested' ? (sortDirection as 'asc' | 'desc' | null) : null;
        } else {
            return sortBy === 'budget' ? sortOrder : null;
        }
    };

    const ordinal = (num: number): string => {
        if (num <= 0) return '';
        const j = num % 10;
        const k = num % 100;

        if (j === 1 && k !== 11) {
            return `${num}st`;
        } else if (j === 2 && k !== 12) {
            return `${num}nd`;
        } else if (j === 3 && k !== 13) {
            return `${num}rd`;
        } else {
            return `${num}th`;
        }
    };

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

    useEffect(() => {
        if (showPagination && widgetRef.current && !isLoading) {
            const rect = widgetRef.current.getBoundingClientRect();
            const isWidgetAboveViewport = rect.bottom < 0;

            if (isWidgetAboveViewport && tallies?.current_page) {
                widgetRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }, [tallies?.current_page, showPagination, isLoading]);

    const formatBudget = (proposal?: ProposalData, fund?: FundData): string => {
        if (!proposal || !proposal.amount_requested) return 'N/A';

        const preferredCurrency = fund?.currency || proposal.currency;
        const amountRequested = Number(proposal.amount_requested);
        if (isNaN(amountRequested)) return 'N/A';

        const currencyCode = String(preferredCurrency || 'ADA');

        // Handle USD separately (already includes proper formatting)
        if (preferredCurrency === 'USD') {
            const result = currency(amountRequested, 2, 'USD');
            return String(result);
        }

        // Handle ADA and other currencies with K/M suffixes
        if (amountRequested >= 1000000) {
            // Millions
            const amount = amountRequested / 1000000;
            const result = currency(amount, 2, currencyCode);
            return String(result) + 'M';
        } else if (amountRequested >= 1000) {
            // Thousands
            const amount = amountRequested / 1000;
            const result = currency(amount, 2, currencyCode);
            return String(result) + 'K';
        } else {
            // Less than 1000
            const result = currency(amountRequested, 2, currencyCode);
            return String(result);
        }
    };

    const shouldShowNoRecords = () => {
        return !tallies?.data || tallies.data.length === 0;
    };

    const filteredData = useMemo(() => {
        if (showPagination) {
            return tallies?.data || [];
        }

        let filtered = tallies?.data || [];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(stat =>
                stat.proposal?.campaign?.id?.toLowerCase().includes(term) ||
                stat.proposal?.title?.toLowerCase().includes(term) ||
                stat.proposal?.campaign?.title?.toLowerCase().includes(term) // ||
                // stat.stake_pub?.toLowerCase().includes(term)
            );
        }

        if (campaignFilter.length > 0) {
            filtered = filtered.filter(stat =>
                stat.proposal?.campaign?.id &&
                campaignFilter.includes(stat.proposal.campaign.id)
            );
        }

        if (fundFilter.length > 0) {
            filtered = filtered.filter(stat =>
                stat.fund?.id &&
                fundFilter.includes(stat.fund?.id)
            );
        }

        filtered = [...filtered].sort((a, b) => {
            let aValue: string | number, bValue: string | number;

            switch (sortBy) {
                case 'votes':
                    aValue = a.tally || 0;
                    bValue = b.tally || 0;
                    break;
                case 'ranking':
                    aValue = a.fund_rank || 999999;
                    bValue = b.fund_rank || 999999;
                    break;
                case 'proposal':
                    aValue = a.proposal?.title || 'zzz';
                    bValue = b.proposal?.title || 'zzz';
                    break;
                case 'budget':
                    aValue = a.proposal?.amount_requested || 0;
                    bValue = b.proposal?.amount_requested || 0;
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
    }, [tallies?.data, sortBy, sortOrder, showPagination]);

    const displayData = showPagination
        ? filteredData
        : filteredData.slice(0, limit);

    const formatLastUpdated = (): string => {
        if (!lastUpdated) {
            return t('activeFund.votingStats.updatedMonthsAgo'); // Fallback
        }

        try {
            const date = new Date(lastUpdated);
            const timeAgo = formatDistanceToNow(date, { addSuffix: true });
            return t('activeFund.votingStats.updated', { time: timeAgo });
        } catch (error) {
            return t('activeFund.votingStats.updatedMonthsAgo'); // Fallback on error
        }
    };

    return (
        <div
            ref={widgetRef}
            className="bg-background w-full rounded-lg border border-content-light shadow-sm"
        >
            <div className="px-6 py-4 border-b border-content-light">
                <Title className="text-4xl font-bold text-content mb-1" level="2">
                    {customTitle || t('activeFund.votingStats.title')}
                </Title>
                <div className="mt-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                        <Paragraph className="text-lg text-gray-500 mb-0">
                            <span className='font-bold text-content'>
                                {t('activeFund.votingStats.liveTally')}
                            </span>
                            ({formatLastUpdated()})
                        </Paragraph>
                        <Paragraph className="text-sm text-gray-persist mt-1">
                            {t('activeFund.votingStats.description')}
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
                        sortOptions={[]}
                        autoFocus={false}
                        className="z-0"
                    />
                </div>
            )}

            {showFilters && filtersVisible && (
                <div className="border-b px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-content">
                                {t('activeFund.votingStats.limitToCampaigns')}
                            </span>
                            <Selector
                                isMultiselect={true}
                                selectedItems={campaignFilter}
                                setSelectedItems={(value) =>
                                    setFilters({
                                        param: ParamsEnum.CAMPAIGNS,
                                        value,
                                        label: t('campaigns'),
                                    })
                                }
                                options={campaigns?.map((campaign) => ({
                                    value: campaign.id,
                                    label: campaign.title,
                                })) || []}
                                hideCheckbox={false}
                                placeholder={t('activeFund.votingStats.selectCampaigns')}
                                className="bg-background"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-content">
                                {t('activeFund.votingStats.limitToFunds')}
                            </span>
                            <Selector
                                isMultiselect={true}
                                selectedItems={fundFilter}
                                setSelectedItems={(value) =>
                                    setFilters({
                                        param: ParamsEnum.FUNDS,
                                        value,
                                        label: t('funds'),
                                    })
                                }
                                options={fundOptions}
                                hideCheckbox={false}
                                placeholder={t('activeFund.votingStats.selectFunds')}
                                className="bg-background"
                            />
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
                                    <SortableTableHeader
                                        label={t('activeFund.votingStats.votesCast')}
                                        sortDirection={getVotesSortDirection()}
                                        onSort={handleVotesSort}
                                    />
                                    <TableHeader label={t('activeFund.votingStats.proposal')} />
                                    <TableHeader label={t('activeFund.votingStats.categoryFundRank')} />
                                    <TableHeader label={t('activeFund.votingStats.approvalChance')} />
                                    <TableHeader label={t('activeFund.votingStats.fundingChance')} />
                                    <SortableTableHeader
                                        label={t('activeFund.votingStats.budget')}
                                        isLastColumn
                                        sortDirection={getBudgetSortDirection()}
                                        onSort={handleBudgetSort}
                                    />
                                </tr>
                            </thead>
                            <tbody className="whitespace-nowrap">
                                {displayData.map((stat, index) => (
                                    <tr key={stat.id || index}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="text-content font-normal">
                                                    {stat.tally || 0}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-auto xl:max-w-xs max-w-md">
                                            {stat.proposal?.slug ? (
                                                <Link
                                                    href={useLocalizedRoute(
                                                        'proposals.proposal.details',
                                                        { slug: stat.proposal.slug }
                                                    )}
                                                    target="_blank"
                                                    className="text-content hover:text-primary cursor-pointer line-clamp-2 break-words leading-tight"
                                                    data-preload="hover"
                                                    title={stat.proposal.title || undefined} // Show full title on hover
                                                >
                                                    {stat.proposal.title}
                                                </Link>
                                            ) : (
                                                <span className="text-content line-clamp-2 break-words leading-tight" title={stat.proposal?.title || undefined}>
                                                    {stat.proposal?.title}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {stat.proposal ? (
                                                    <div>
                                                        <span className="text-slate-400 text-sm">
                                                    {stat.category_rank ? `${ordinal(stat.category_rank)}` : '-'}
                                                    </span>
                                                            <span className="text-slate-400 text-sm">
                                                        /
                                                    </span>
                                                            <span className="text-slate-400 text-sm">
                                                        {stat.fund_rank ? `${ordinal(stat.fund_rank)}` : '-'}
                                                    </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {stat.chance_approval !== null && stat.chance_approval !== undefined ? (
                                                    <>
                                                        <span className={
                                                            `font-medium ${
                                                                stat.chance_approval >= 75 ? 'text-success' :
                                                                stat.chance_approval >= 50 ? 'text-yellow-600' :
                                                                stat.chance_approval >= 25 ? 'text-warning' :
                                                                ''
                                                            }`
                                                        }>
                                                            {stat.chance_approval.toFixed(1)}%
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {stat.chance_funding !== null && stat.chance_funding !== undefined ? (
                                                    <>
                                                        <span className={
                                                            `font-medium ${
                                                                stat.chance_funding >= 100 ? 'text-success' :
                                                                stat.chance_funding >= 75 ? 'text-yellow-600' :
                                                                stat.chance_funding >= 25 ? 'text-warning' :
                                                                'text-warning'
                                                            }`
                                                        }>
                                                            {stat.chance_funding === 100 ? `✓ ${t('activeFund.votingStats.likelyFunded')}` :
                                                             stat.chance_funding === 0 ? `✗ ${t('activeFund.votingStats.likelySkipped')}` :
                                                             `${stat.chance_funding.toFixed(1)}%`}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell isLastColumn>
                                            <span className="font-normal">
                                                {formatBudget(stat?.proposal || undefined, stat.fund || undefined)}
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
