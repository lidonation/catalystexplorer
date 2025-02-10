import Button from '@/Components/atoms/Button';
import Selector from '@/Components/atoms/Selector';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { IdeaScaleSearchEnum } from '@/enums/ideascale-search-enums';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import IdeascaleSortingOptions from '@/lib/IdeascaleSortOptions';
import ActiveFilters from '@/Pages/Proposals/Partials/ActiveFilters';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfilesSearchControls from './IdeascaleProfileSearchControls';
import IdeascaleProfilesFilters from './IdeascaleProfilesFilters';

const IdeaScaleProfileToolbar = () => {
    const [toggleFilterVisibility, setToggleFilterVisibility] = useState(false);
    const { getFilter, setFilters, filters } = useFilterContext();
    const { t } = useTranslation();
    const filtersCount = filters.filter(
        (filter) =>
            filter.param !== ProposalParamsEnum.PAGE && filter.value.length > 0,
    ).length;

    return (
        <div className="flex w-full flex-col gap-2">
            <div>
                <IdeascaleProfilesSearchControls />
            </div>
            <div className="flex flex-row items-end justify-end">
                <div className="flex flex-row gap-2">
                    <Button
                        className={`border-input bg-background flex flex-row items-center gap-2 rounded-lg border px-2 py-1 shadow-xs ${
                            toggleFilterVisibility
                                ? 'border-accent-blue text-primary ring-offset-background ring-1'
                                : 'hover:bg-background-lighter text-gray-500'
                        }`}
                        onClick={() =>
                            setToggleFilterVisibility(!toggleFilterVisibility)
                        }
                    >
                        <FilterLinesIcon className={'size-6'} />
                        <span>{t('filters')}</span>
                        <span>({filtersCount})</span>
                    </Button>
                    <Selector
                        isMultiselect={false}
                        selectedItems={getFilter(IdeaScaleSearchEnum.SORTS)}
                        setSelectedItems={(value) =>
                            setFilters({
                                param: IdeaScaleSearchEnum.SORTS,
                                value,
                                label: t('proposals.options.sort'),
                            })
                        }
                        options={IdeascaleSortingOptions()}
                        hideCheckbox={true}
                        placeholder={t('proposals.options.sort')}
                        className={
                            getFilter(IdeaScaleSearchEnum.SORTS)
                                ? 'bg-background-lighter text-primary cursor-default'
                                : 'hover:bg-background-lighter text-gray-500'
                        }
                    />
                </div>
            </div>

            <div className="container mx-auto flex justify-start px-0 py-2">
                <ActiveFilters sortOptions={IdeascaleSortingOptions()} />
            </div>

            <div
                className={`${toggleFilterVisibility ? 'max-h-[500px]' : 'max-h-0'} overflow-hidden transition-[max-height] duration-500 ease-in-out`}
            >
                <IdeascaleProfilesFilters />
            </div>
        </div>
    );
};

export default IdeaScaleProfileToolbar;
