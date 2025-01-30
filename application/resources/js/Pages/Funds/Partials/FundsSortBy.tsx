import Selector from '@/Components/Select';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';

export default function FundSortBy() {
    const { t } = useTranslation();
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
                selectedItems={getFilter(ProposalParamsEnum.SORTS)}
                setSelectedItems={(value) =>
                    setFilters({
                        param: ProposalParamsEnum.SORTS,
                        value,
                        label: 'Sorts',
                    })
                }
                hideCheckbox={true}
                placeholder={t('funds.sortBy')}
                className={`bg-background ${
                    getFilter(ProposalParamsEnum.SORTS)
                        ? 'bg-background text-primary cursor-default'
                        : 'hover:bg-background-lighter text-gray-500'
                }`}
            />
        </div>
    );
}
