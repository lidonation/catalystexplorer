import Checkbox from '@/Components/atoms/Checkbox';
import { PaginatedData } from '@/types/paginated-data';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useEffect, useState } from 'react';
import FundData = App.DataTransferObjects.FundData;

interface FundFiltersProps {
    selectedItems: any;
    proposalsCount: { [key: string]: number };
    setSelectedItems: (updatedItems: string[]) => void;
}

const FundsFilter: React.FC<FundFiltersProps> = ({
    selectedItems = [],
    proposalsCount,
    setSelectedItems,
}) => {
    const { t } = useLaravelReactI18n();
    const [funds, setFunds] = useState<PaginatedData<FundData[]> | null>();
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        // Check if funds are already cached in localStorage to prevent refetching
        const cachedFunds = localStorage.getItem('funds');
        if (cachedFunds?.length === 0) {
            setFunds(JSON.parse(cachedFunds));
        } else {
            fetchFunds();
        }
    }, []);

    const fetchFunds = async () => {
        try {
            setIsFetching(true);
            const response = await axios.get(route('api.funds.legacy'));
            const fetchedFunds: PaginatedData<FundData[]> =
                response?.data || [];
            setFunds(fetchedFunds);
            localStorage.setItem('funds', JSON.stringify(fetchedFunds));
        } catch (error) {
            console.error('Failed to fetch funds:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleSelect = (value: string | null) => {
        const updatedItems = selectedItems.includes(value)
            ? selectedItems.filter((item: string) => item !== value)
            : [...(selectedItems ?? []), value];
        setSelectedItems(updatedItems);
    };

    if (isFetching) {
        return <div>{t('loading')}</div>;
    }

    return (
        <div className="w-full py-8" data-testid="funds-filter">
            <div className="overflow-x-auto pb-4">
                <ul
                    className="flex min-w-max gap-4 whitespace-nowrap"
                    data-testid="funds-filter-list"
                >
                    {funds?.data &&
                        funds?.data.length &&
                        funds.data.map((fund) => {
                            return (
                                <li
                                    key={fund.id}
                                    className={`bg-background hover:border-primary flex flex-shrink-0 cursor-pointer rounded-md border-2 border-transparent shadow-xs ${selectedItems.includes(fund) ? 'border-primary' : ''}`}
                                    onClick={() => handleSelect(fund.id)}
                                    aria-label={fund.id as string}
                                    data-testid={`fund-filter-item-${fund.id}`}
                                >
                                    <div className="m-4">
                                        <Checkbox
                                            id={fund.id as string | undefined}
                                            value={fund.id as string}
                                            checked={selectedItems.includes(
                                                fund.id,
                                            )}
                                            onChange={() => {}}
                                            className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary mr-2 h-4 w-4 shadow-xs focus:border"
                                            data-testid={`fund-checkbox-${fund.id}`}
                                        />
                                    </div>
                                    <div className="m-4 ml-1 w-full">
                                        <div
                                            className="mb-2 font-medium"
                                            data-testid={`fund-label-${fund.label}`}
                                        >
                                            {fund.label}
                                        </div>
                                        <div
                                            className="flex w-full justify-between gap-4"
                                            data-testid={`fund-proposals-count-${fund.title}`}
                                        >
                                            <div className="text-gray-persist">
                                                {t('proposals.totalProposals')}
                                            </div>
                                            <div className="font-bold">
                                                {fund.title
                                                    ? proposalsCount[fund.title]
                                                    : 0}
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

export default FundsFilter;
