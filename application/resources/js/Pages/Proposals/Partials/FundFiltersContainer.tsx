import { useFilterContext } from '@/Context/FiltersContext';
import FundsFilter from './FundsFilter';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';

type FundFiltersContainerProps = {
    funds: { [key: string]: number };
};
function FundFiltersContainer({ funds }: FundFiltersContainerProps) {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();

    const handleSetSelectedItems = (updatedItems: any[]) => {
        setFilters(ProposalParamsEnum.FUNDS, updatedItems);
    };
    return (
        <FundsFilter
            proposalsCount={funds}
            setSelectedItems={handleSetSelectedItems}
            selectedItems={filters[ProposalParamsEnum.FUNDS] ?? []}
        />
    );
}

export default FundFiltersContainer;
