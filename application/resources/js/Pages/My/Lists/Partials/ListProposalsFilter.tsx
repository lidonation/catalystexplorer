import React from 'react';
import { useFilterContext } from '@/Context/FiltersContext';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Checkbox from '@/Components/atoms/Checkbox';

interface ListProposalsFilterProps {
    funds: any[];
    fundsCount: Record<string, any>;
}

const ListProposalsFilter: React.FC<ListProposalsFilterProps> = ({
    funds,
    fundsCount,
}) => {
    const { t } = useLaravelReactI18n();
    const { setFilters, getFilter } = useFilterContext();

    const selectedFundId = getFilter('fund_id');

    const handleSelect = (fundId: string) => {
        const newValue = selectedFundId === fundId ? null : fundId;
        setFilters({
            param: 'fund_id',
            label: t('filters.fund'),
            value: newValue || undefined,
        });
    };

    return (
        <div className="w-full py-8" data-testid="list-funds-filter">
            <div className="overflow-x-auto pb-4">
                <ul
                    className="flex gap-4 whitespace-nowrap"
                    data-testid="list-funds-filter-list"
                >
                    {funds && funds.length > 0 && funds.map((fund) => {
                        const count = fundsCount[fund.id]?.count || 0;
                        const isSelected = selectedFundId === fund.id;
                        
                        return (
                            <li
                                key={fund.id}
                                className={`bg-background hover:border-primary flex flex-shrink-0 cursor-pointer rounded-md border-2 border-transparent shadow-xs ${
                                    isSelected ? 'border-primary' : ''
                                }`}
                                onClick={() => handleSelect(fund.id)}
                                aria-label={fund.id}
                                data-testid={`list-fund-filter-item-${fund.id}`}
                            >
                                <div className="m-4">
                                    <Checkbox
                                        id={fund.id}
                                        value={fund.id}
                                        checked={isSelected}
                                        onChange={() => {}}
                                        className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary mr-2 h-4 w-4 shadow-xs focus:border"
                                        data-testid={`list-fund-checkbox-${fund.id}`}
                                    />
                                </div>
                                <div className="m-4 ml-1 w-full">
                                    <div
                                        className="mb-2 font-medium"
                                        data-testid={`list-fund-label-${fund.label}`}
                                    >
                                        {fund.label}
                                    </div>
                                    <div
                                        className="flex w-full justify-between gap-4"
                                        data-testid={`list-fund-proposals-count-${fund.title}`}
                                    >
                                        <div className="text-gray-persist">
                                            {t('proposals.proposals')}
                                        </div>
                                        <div className="font-bold">
                                            {count}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default ListProposalsFilter;
