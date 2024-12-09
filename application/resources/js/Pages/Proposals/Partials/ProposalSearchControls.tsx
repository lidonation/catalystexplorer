import SearchBar from '@/Components/SearchBar';
import Selector from '@/Components/Select';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';

function ProposalSearchControls() {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();

    const { t } = useTranslation();

    const sortingOptions = [
        { value: 'created_at:asc', label: t('proposals.options.oldToNew') },
        { value: 'created_at:desc', label: t('proposals.options.newToOld') },
        {
            value: 'amount_requested:asc',
            label: t('proposals.options.lowToHigh'),
        },
        {
            value: 'amount_requested:desc',
            label: t('proposals.options.highToLow'),
        },
    ];

    const handleSearch = (search: string) => {
        console.log('Search value:', search);
    };
    return (
        <div className="container flex flex-col gap-4 mx-auto bg-background-lighter pb-4 pt-6">
            <div className="flex items-center justify-end gap-2">
                <SearchBar
                    handleSearch={handleSearch}
                    autoFocus
                    showRingOnFocus
                />

                <Selector
                    className="h-10 min-w-64"
                    isMultiselect={false}
                    options={sortingOptions}
                    setSelectedItems={(value) =>
                        setFilters(ProposalParamsEnum.SORTS, value)
                    }
                    selectedItems={filters[ProposalParamsEnum.SORTS]}
                    context={t('proposals.options.sort')}
                />
            </div>
            <div className='text-center'>Active Filters goes here</div>
        </div>
    );
}

export default ProposalSearchControls;
