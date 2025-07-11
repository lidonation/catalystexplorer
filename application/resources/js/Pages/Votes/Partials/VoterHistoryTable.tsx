import Paginator from '@/Components/Paginator';
import ToolTipHover from '@/Components/ToolTipHover';
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import SecondarySearchControls from '@/Components/atoms/SecondarySearchControls';
import Title from '@/Components/atoms/Title';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { VoteEnums } from '@/enums/vote-search-enums';
import VoteSortOptions from '@/lib/VoteSortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link, router } from '@inertiajs/react';
import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import VoteFilters from './VoteFilters';
import VoteHistoryTableLoader from './VoterHistoryTableLoader';
import VoterHistoryData = App.DataTransferObjects.VoterHistoryData;

interface VoterHistoryTableProps {
    voterHistories?: PaginatedData<VoterHistoryData[]>;
    filters: SearchParams;
    showFilters?: boolean;
    setShowFilters?: Dispatch<SetStateAction<boolean>>;
    unifiedSearch?: boolean;
    customTitle?: string;
}

const VoterHistoryTable: React.FC<VoterHistoryTableProps> = ({
    voterHistories,
    showFilters,
    setShowFilters,
    unifiedSearch = false,
    customTitle,
}) => {
    const { t } = useTranslation();
    const { filters, setFilters } = useFilterContext();
    const [isLoading, setIsLoading] = useState(false);
    const prevFiltersRef = useRef('');
    const isInitialRender = useRef(true);
    const [hoveredCell, setHoveredCell] = useState<{
        rowIndex: number;
        col: string;
    } | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    // For internal filter toggle if no external one is provided
    const [internalShowFilters, setInternalShowFilters] = useState(false);
    // Handle filters toggle by using either the provided state or internal state
    const filtersVisible =
        showFilters !== undefined ? showFilters : internalShowFilters;
    const toggleFilters: Dispatch<SetStateAction<boolean>> =
        setShowFilters || setInternalShowFilters;
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            prevFiltersRef.current = JSON.stringify(filters);
            return;
        }
        if (filters.length === 0) return;
        const nonPrimaryFilters = filters.filter(
            (filter) => filter.param !== VoteEnums.QUERY,
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

        nonPrimaryFilters.forEach((filter) => {
            if (
                filter.param &&
                filter.value !== undefined &&
                filter.value !== ''
            ) {
                params[filter.param] = filter.value;
            }
        });

        router.get(window.location.pathname, params, {
            preserveScroll: true,
            preserveState: true,
            only: ['voterHistories', 'filters'],
            replace: true,
            onFinish: () => setIsLoading(false),
        });
    }, [filters]);

    const hasActiveFilters = () => {
        if (!filters || filters.length === 0) return false;

        return filters.some(
            (filter) =>
                filter.param === VoteEnums.QUERY ||
                filter.param === VoteEnums.SECONDARY_QUERY ||
                (filter.value !== undefined && filter.value !== ''),
        );
    };

    const safelyGetNestedValue = (
        obj: any,
        path: string,
        defaultValue: any = 'N/A',
    ) => {
        try {
            const result = path
                .split('.')
                .reduce(
                    (o, key) => (o && o[key] !== undefined ? o[key] : null),
                    obj,
                );
            return result !== null && result !== undefined
                ? result
                : defaultValue;
        } catch (e) {
            console.error(`Error accessing path ${path}:`, e);
            return defaultValue;
        }
    };

    const formatVotingPower = (value: any): string | number => {
        if (value === undefined || value === null) return '₳ 0';

        try {
            const numValue = Number(value);
            if (Number.isNaN(numValue)) return '₳ 0';

            const adaValue = numValue / 1000000;

            return currency(adaValue ?? 0, 2, 'ADA');
        } catch (e) {
            console.error('Error formatting voting power:', e);
            return '₳ 0';
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopiedField(field);
                setTimeout(() => setCopiedField(null), 2000);
            })
            .catch((err) => {
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

    const getValueWithTooltip = (
        rowIndex: number,
        history: VoterHistoryData,
        col: string,
        value: string,
    ) => {
        const isHovered =
            hoveredCell &&
            hoveredCell.rowIndex === rowIndex &&
            hoveredCell.col === col;

        return (
            <div className="relative flex w-full items-start justify-between">
                <div
                    className="flex-1 cursor-pointer truncate"
                    onMouseEnter={() => handleMouseEnter(rowIndex, col)}
                    onMouseLeave={handleMouseLeave}
                >
                    {truncateText(value)}
                </div>

                {isHovered && value.length > 10 && (
                    <div className="absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full transform">
                        <ToolTipHover props={value} />
                    </div>
                )}

                <Button
                    className="text-gray-persist hover:text-primary flex-shrink-0 focus:outline-none"
                    onClick={() => copyToClipboard(value, `${rowIndex}-${col}`)}
                >
                    <CopyIcon width={16} height={16} />
                </Button>

                {copiedField === `${rowIndex}-${col}` && (
                    <span className="bg-content-success-light text-content-success-darker absolute -top-10 right-0 z-10 rounded px-2 py-1 text-xs">
                        {t('copied')}
                    </span>
                )}
            </div>
        );
    };
    const formatTimestamp = (isoTimestamp?: string): string => {
        if (!isoTimestamp) return 'N/A';
        try {
            const date = new Date(isoTimestamp);
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            };
            return date.toLocaleString('en-US', options);
        } catch (e) {
            console.error('Error formatting timestamp:', e);
            return isoTimestamp;
        }
    };

    const shouldShowNoRecords = () => {
        return (
            !isLoading &&
            (hasSearched || hasActiveFilters()) &&
            (!voterHistories?.data || voterHistories.data.length === 0)
        );
    };

    const sortOptionsList = VoteSortOptions();

    return (
        <div className="overflow-x-auto">
            <section className="container">
                <Title
                    className="border-dark-light border-b pt-4 pb-4 font-bold"
                    level="4"
                >
                    {customTitle || t('vote.votingHistory')}
                </Title>
                 <div className="pt-6"></div>
                <SecondarySearchControls
                    onFiltersToggle={toggleFilters}
                    sortOptions={sortOptionsList}
                    searchPlaceholder={
                        unifiedSearch
                            ? t('vote.searchStakeFragmentCaster')
                            : t('vote.searchPlaceholder')
                    }
                    searchParam={
                        unifiedSearch
                            ? VoteEnums.QUERY
                            : VoteEnums.SECONDARY_QUERY
                    }
                    searchLabel={
                        unifiedSearch
                            ? t('vote.search')
                            : t('vote.secondarySearch')
                    }
                    isUnifiedSearch={unifiedSearch}
                />
            </section>

            <section
                className={`container overflow-hidden transition-all duration-500 ease-in-out ${
                    filtersVisible ? 'my-4 max-h-[500px]' : 'max-h-0'
                }`}
            >
                <VoteFilters />
            </section>

            {shouldShowNoRecords() && (
                <div className="bg-background mb-10 flex w-full flex-col items-start justify-center rounded-lg px-4 py-8">
                    <RecordsNotFound />
                    <Paragraph className="text-dark mt-4 text-left">
                        {t('vote.noStakeAddressFound')}
                    </Paragraph>
                </div>
            )}

            {(!shouldShowNoRecords() || isLoading) && (
                <div className="container mb-4 pb-4 pt-6">
                    <div className="bg-background border-gray-100 w-full overflow-hidden rounded-lg border shadow-sm ">
                        <div className="overflow-x-auto">
                            <table className="w-max min-w-full">
                                <thead className="bg-background-lighter whitespace-nowrap">
                                    <tr>
                                        <th className="border-gray-100 text-gray-persist bg-background-lighter border-r border-b px-4 py-3 text-left font-medium">
                                            {t('vote.table.fund')}
                                        </th>
                                        <th className="border-gray-100 text-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                            {t('vote.table.stakeAddress')}
                                        </th>
                                        <th className="border-gray-100 text-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                            {t('vote.table.fragmentId')}
                                        </th>
                                        <th className="border-gray-100 text-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                            {t('vote.table.caster')}
                                        </th>
                                        <th className="border-gray-100 text-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                            {t('vote.table.timestamp')}
                                        </th>
                                        <th className="border-gray-100 text-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                            {t('vote.table.choice')}
                                        </th>
                                        <th className="border-gray-100 text-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                            {t('vote.table.votingPower')}
                                        </th>
                                        <th className="border-gray-100 text-gray-persist border-b px-4 py-3 text-left font-medium">
                                            {t('vote.table.rawFragment')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="whitespace-nowrap">
                                    {!isLoading &&
                                        voterHistories?.data &&
                                        voterHistories.data.length > 0 &&
                                        voterHistories.data.map(
                                            (history, index) => (
                                                <tr
                                                    key={safelyGetNestedValue(
                                                        history,
                                                        'fragment_id',
                                                        index,
                                                    )}
                                                >
                                                    <td className="border-gray-100 text-darker font-medium bg-background border-r border-b px-4 py-4">
                                                        {history?.snapshot?.fund
                                                            ? history.snapshot
                                                                  .fund.title
                                                            : t(
                                                                  'vote.notAvailable',
                                                              )}
                                                    </td>
                                                    <td className="border-gray-100 text-darker font-normal w-40 border-r border-b px-4 py-4">
                                                        <Link
                                                            href={useLocalizedRoute(
                                                                'jormungandr.wallets.show',
                                                                {
                                                                    stakeKey:
                                                                        history?.stake_address ??
                                                                        '',
                                                                    catId:
                                                                        history?.caster ??
                                                                        '',
                                                                },
                                                            )}
                                                            className="hover:text-primary"
                                                        >
                                                            {history.stake_address
                                                                ? getValueWithTooltip(
                                                                      index,
                                                                      history,
                                                                      'stake_address',
                                                                      history.stake_address,
                                                                  )
                                                                : t(
                                                                      'vote.notAvailable',
                                                                  )}
                                                        </Link>
                                                    </td>
                                                    <td className="border-gray-100 text-darker font-normal w-40 border-r border-b px-4 py-4">
                                                        {getValueWithTooltip(
                                                            index,
                                                            history,
                                                            'fragment_id',
                                                            safelyGetNestedValue(
                                                                history,
                                                                'fragment_id',
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="border-gray-100 text-darker font-normal w-40 border-r border-b px-4 py-4">
                                                        <Link
                                                            href={useLocalizedRoute(
                                                                'jormungandr.wallets.show',
                                                                {
                                                                    stakeKey:
                                                                        history?.stake_address ??
                                                                        '',
                                                                    catId:
                                                                        history?.caster ??
                                                                        '',
                                                                },
                                                            )}
                                                            className="hover:text-primary"
                                                        >
                                                            {getValueWithTooltip(
                                                                index,
                                                                history,
                                                                'caster',
                                                                safelyGetNestedValue(
                                                                    history,
                                                                    'caster',
                                                                ),
                                                            )}
                                                        </Link>
                                                    </td>
                                                    <td className="border-gray-100 text-content  font-medium border-r border-b px-4 py-4">
                                                        <div className="flex flex-col">
                                                            <span>
                                                                {history.time}
                                                            </span>
                                                            {/* For time ago */}
                                                            {/* <span className="text-xs text-gray-persist">
                              {history.time}
                            </span> */}
                                                        </div>
                                                    </td>
                                                    <td className="border-gray-100 text-darker font-medium border-r border-b px-4 py-4 text-left">
                                                        {typeof safelyGetNestedValue(
                                                            history,
                                                            'choice',
                                                        ) === 'number'
                                                            ? safelyGetNestedValue(
                                                                  history,
                                                                  'choice',
                                                              ).toString()
                                                            : safelyGetNestedValue(
                                                                  history,
                                                                  'choice',
                                                              )}
                                                    </td>
                                                    <td className="border-gray-100 text-content border-r border-b px-4 py-4">
                                                        <div className="flex items-start">
                                                            <span>
                                                                {formatVotingPower(
                                                                    history?.voting_power,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="border-gray-100 text-darker font-normal w-40 border-r border-b px-4 py-4">
                                                        {getValueWithTooltip(
                                                            index,
                                                            history,
                                                            'raw_fragment',
                                                            safelyGetNestedValue(
                                                                history,
                                                                'raw_fragment',
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                </tbody>
                            </table>
                        </div>

                        {!isLoading &&
                            voterHistories &&
                            voterHistories.data &&
                            voterHistories.data.length > 0 && (
                                <div className="bg-background  rounded-b-lg  border-gray-200 border-t px-2">
                                    <Paginator
                                        pagination={voterHistories}
                                        linkProps={{
                                            preserveScroll: true,
                                            only: ['voterHistories', 'filters'],
                                            replace: true,
                                            onClick: (e) => {
                                                const target =
                                                    e.target as HTMLAnchorElement;
                                                if (
                                                    target.href &&
                                                    target.href.includes(
                                                        VoteEnums.PAGE,
                                                    )
                                                ) {
                                                    e.preventDefault();
                                                    const url = new URL(
                                                        target.href,
                                                    );
                                                    const pageValue =
                                                        url.searchParams.get(
                                                            VoteEnums.PAGE,
                                                        );
                                                    if (pageValue) {
                                                        setFilters({
                                                            param: VoteEnums.PAGE,
                                                            value: parseInt(
                                                                pageValue,
                                                            ),
                                                            label: 'Current Page',
                                                            resetPageOnChange:
                                                                false,
                                                        });
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>
                            )}
                    </div>
                </div>
            )}

            {isLoading && <VoteHistoryTableLoader />}
        </div>
    );
};

export default VoterHistoryTable;
