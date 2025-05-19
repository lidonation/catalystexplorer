import ActiveFilters from '@/Components/atoms/ActiveFilters/ActiveFilters';
import Selector from '@/Components/atoms/Selector';
import SearchBar from '@/Components/SearchBar';
import { SearchSelect } from '@/Components/SearchSelect';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import { useProposalComparison } from '@/Context/ProposalComparisonContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import { Button } from '@headlessui/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';


export default function ComparisonTableFilters() {
    const { t } = useTranslation();
    const {
        searchQuery,
        setSearchQuery,
        setFilter,
        getFilter,
        filters,
        filtersCount,
    } = useProposalComparison();

    const [showFilters, setShowFilters] = useState(false);

    const toggleFilters = useCallback(() => {
        setShowFilters((prev) => !prev);
    }, []);

    const handleSearch = (term: string) => {
        setSearchQuery(term);
    };


    const sortOptions = [
        {
            label: t('proposals.options.budgetHighToLow'),
            value: 'amount_requested:desc',
        },
        {
            label: t('proposals.options.budgetLowToHigh'),
            value: 'amount_requested:asc',
        },
        {
            label: t('proposals.options.paymentsReceivedHighToLow'),
            value: 'amount_received:desc',
        },
        {
            label: t('proposals.options.paymentsReceivedLowToHigh'),
            value: 'amount_received:asc',
        },
        {
            label: t('proposals.options.yesVotesHighToLow'),
            value: 'yes_votes_count:desc',
        },
        {
            label: t('proposals.options.yesVotesLowToHigh'),
            value: 'yes_votes_count:asc',
        },
        {
            label: t('proposals.options.noVotesHighToLow'),
            value: 'abstain_votes_count:desc',
        },
        {
            label: t('proposals.options.noVotesLowToHigh'),
            value: 'abstain_votes_count:asc',
        },
    ];


    return (
        <div className="container mb-6">
            <section>
                <div className="sticky top-0 z-10 container mx-auto flex w-full flex-col gap-3 px-0 py-3 backdrop-blur-md">
                    <div className="flex items-center justify-end gap-2">
                        <SearchBar
                            border="border-dark-light"
                            handleSearch={handleSearch}
                            autoFocus
                            showRingOnFocus
                            initialSearch={searchQuery}
                            reloadOnClear={false}
                            placeholder={t(
                                'proposalComparison.searchPlaceholder',
                            )}
                        />
                        <Button
                            className={`border-input bg-background flex cursor-pointer flex-row items-center gap-2 rounded-lg border px-3 py-1.5 shadow-xs ${
                                showFilters
                                    ? 'border-accent-blue text-primary ring-offset-background ring-1'
                                    : 'hover:bg-background-lighter text-gray-500'
                            }`}
                            onClick={toggleFilters}
                            aria-label="Show Filters"
                        >
                            <FilterLinesIcon className="size-6" />
                            <span>{t('filters')}</span>
                            <span>({filtersCount})</span>
                        </Button>

                        <Selector
                            isMultiselect={false}
                            selectedItems={
                                getFilter(ParamsEnum.SORTS)?.value ?? ''
                            }
                            setSelectedItems={(value) => {
                                setFilter({
                                    param: ParamsEnum.SORTS,
                                    value,
                                    label: t(
                                        'proposals.options.amountRequested',
                                    ),
                                });
                            }}
                            options={sortOptions}
                            hideCheckbox={true}
                            placeholder={t('proposals.options.sort')}
                            className={`bg-background ${
                                getFilter(ParamsEnum.SORTS)?.value
                                    ? 'bg-background-lighter text-primary'
                                    : 'hover:bg-background-lighter text-gray-500'
                            }`}
                        />
                    </div>

                    <div className="container mx-auto flex justify-start px-0">
                        <ActiveFilters
                            sortOptions={sortOptions}
                            filters={filters}
                            setFilters={setFilter}
                        />
                    </div>
                </div>
            </section>

            <section
                className={`flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                    showFilters ? 'max-h-[500px]' : 'max-h-0'
                }`}
            >
                <div className="bg-background w-full rounded-xl p-4 shadow-lg">
                    <div className="bg-background w-full rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-2">
                            <div className="col-span-1 flex flex-col gap-2 pb-4">
                                <span>{t('reviews.filters.funds')}</span>
                                <SearchSelect
                                    key="funds"
                                    domain="funds"
                                    selected={
                                        getFilter(ParamsEnum.FUNDS)?.value ?? []
                                    }
                                    onChange={(value) =>
                                        setFilter({
                                            param: ParamsEnum.FUNDS,
                                            value,
                                            label: 'Fund',
                                        })
                                    }
                                    placeholder="Select"
                                    multiple={true}
                                    valueField="label"
                                    labelField="title"
                                />
                            </div>

                            <div className="col-span-1 flex flex-col gap-2 pb-4">
                                <span>
                                    {t('proposals.filters.projectStatus')}
                                </span>
                                <Selector
                                    isMultiselect={true}
                                    options={[
                                        {
                                            value: 'complete',
                                            label: t(
                                                'proposals.options.complete',
                                            ),
                                        },
                                        {
                                            value: 'in_progress',
                                            label: t(
                                                'proposals.options.inProgress',
                                            ),
                                        },
                                        {
                                            value: 'unfunded',
                                            label: t(
                                                'proposals.options.unfunded',
                                            ),
                                        },
                                    ]}
                                    setSelectedItems={(value) =>
                                        setFilter({
                                            param: ParamsEnum.PROJECT_STATUS,
                                            value,
                                            label: 'Status',
                                        })
                                    }
                                    selectedItems={
                                        getFilter(ParamsEnum.PROJECT_STATUS)
                                            ?.value ?? []
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}