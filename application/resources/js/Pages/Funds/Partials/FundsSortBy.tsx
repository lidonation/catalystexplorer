import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function FundSortBy() {
    const { t } = useLaravelReactI18n();
    const { getFilter, setFilters, filters } = useFilterContext();
    const sortingOptions = [
        { label: t('funds.options.lowToHigh'), value: 'amount:asc' },
        { label: t('funds.options.highToLow'), value: 'amount:desc' },
        {
            label: t('funds.options.proposalCountsLowToHigh'),
            value: 'proposals_count:asc',
        },
        {
            label: t('funds.options.proposalCountsHighToLow'),
            value: 'proposals_count:desc',
        },
    ];
    return (
        <div className="mt-4 ml-4 flex justify-end pb-1 lg:pb-8">
            <Selector
                isMultiselect={false}
                options={sortingOptions}
                selectedItems={getFilter(ParamsEnum.SORTS)}
                setSelectedItems={(value) =>
                    setFilters({
                        param: ParamsEnum.SORTS,
                        value,
                        label: 'Sorts',
                    })
                }
                hideCheckbox={true}
                placeholder={t('funds.sortBy')}
                className={`bg-background ${
                    getFilter(ParamsEnum.SORTS)
                        ? 'bg-background text-primary cursor-default'
                        : 'hover:bg-background-lighter text-gray-500'
                }`}
            />
        </div>
    );
}
