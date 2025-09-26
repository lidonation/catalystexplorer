import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { BookMarkCollectionEnum } from '@/enums/bookmark-collection-enums';
import { ParamsEnum } from '@/enums/proposal-search-params';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import { SearchParams } from '@/types/search-params';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface VoterListFiltersProps {
    campaigns: {
        id: number;
        title: string;
        hash: string;
    }[];
    filters: SearchParams;
    bookmarkHash: string;
    fundSlug?: string;
}

export default function VoterListFilters({
    campaigns,
    filters,
    bookmarkHash,
    fundSlug,
}: VoterListFiltersProps) {
    const { t } = useLaravelReactI18n();
    const { setFilters, getFilter } = useFilterContext();

    const buildUpdatedFilters = (updates: Partial<SearchParams> = {}) => {
        const baseFilters: Record<string, any> = { ...filters };

        if (fundSlug) {
            baseFilters[ParamsEnum.FUNDS] = fundSlug;
        }

        if (bookmarkHash) {
            baseFilters[BookMarkCollectionEnum.BOOKMARK_COLLECTION] =
                bookmarkHash;
        }

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                delete baseFilters[key];
            } else {
                baseFilters[key] = value;
            }
        });

        if (
            Object.keys(updates).length > 0 &&
            !updates[ParamsEnum.PAGE] &&
            baseFilters[ParamsEnum.PAGE]
        ) {
            baseFilters[ParamsEnum.PAGE] = 1;
        }

        return baseFilters;
    };

    const handleFilterChange = (
        paramName: string,
        value: string | number | string[] | number[],
    ) => {
        let normalized: string | number | string[] | number[];

        if (paramName === ParamsEnum.SORTS && Array.isArray(value)) {
            normalized = value[0] ?? '';
        } else {
            normalized = value;
        }

        router.get(
            window.location.pathname,
            buildUpdatedFilters({ [paramName]: normalized }),
            { preserveState: true, replace: true },
        );
    };

    return (
        <div className="flex flex-col gap-2 md:flex-row">
            <div className="self-start text-sm text-gray-600 md:self-center">
                {t('workflows.voterList.selectCampaign')}
            </div>
            <div className="flex gap-2">
                <Selector
                    data-testid="opensource-selector"
                    data-testid-button="opensource-selector-button"
                    isMultiselect={true}
                    options={campaigns.map((campaign) => ({
                        label: campaign.title ?? '',
                        value: String(campaign.id),
                    }))}
                    setSelectedItems={(value) =>
                        setFilters({
                            label: t('proposals.filters.campaigns'),
                            value,
                            param: ParamsEnum.CAMPAIGNS,
                        })
                    }
                    selectedItems={getFilter(ParamsEnum.CAMPAIGNS) ?? []}
                />

                <Selector
                    isMultiselect={false}
                    selectedItems={filters[ParamsEnum.SORTS] || []}
                    setSelectedItems={(value) =>
                        handleFilterChange(
                            ParamsEnum.SORTS,
                            Array.isArray(value) ? value : [value],
                        )
                    }
                    options={ProposalSortingOptions()}
                    hideCheckbox={true}
                    placeholder={t('proposals.options.sort')}
                    className="w-full shadow md:w-auto"
                />
            </div>
        </div>
    );
}
