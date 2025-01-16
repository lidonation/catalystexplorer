import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import FundsFilter from './FundsFilter';

type FundFiltersContainerProps = {
    funds: { [key: string]: number };
};
function FundFiltersContainer({ funds }: FundFiltersContainerProps) {
    const { getFilter, setFilters } = useFilterContext();

    const handleSetSelectedItems = (updatedItems: any[]) => {
        setFilters({
            param: ProposalParamsEnum.FUNDS,
            value: updatedItems,
            label: 'Funds',
        });
    };
    return (
        <FundsFilter
            proposalsCount={funds}
            setSelectedItems={handleSetSelectedItems}
            selectedItems={getFilter(ProposalParamsEnum.FUNDS) ?? []}
        />
    );
}

export default FundFiltersContainer;
