import Checkbox from '@/Components/Checkbox';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const [funds, setFunds] = useState<string[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        // Check if funds are already cached in localStorage to prevent refetching
        const cachedFunds = localStorage.getItem('funds');
        if (cachedFunds?.length === 0) {
            setFunds(JSON.parse(cachedFunds));
        } else {
            fetchFunds();
            console.log("!cached")
        }
    }, []);

    const fetchFunds = async () => {
        try {
            setIsFetching(true);
            const response = await axios.get(route('api.fundTitles'));
            const fetchedFunds = response?.data || [];
            const sortedFunds = fetchedFunds.sort((a: string, b: string) => {
                const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
                const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
                return numB - numA;
            });
            setFunds(sortedFunds);
            // Cache funds locally
            localStorage.setItem('funds', JSON.stringify(sortedFunds));
            console.log("cached2", JSON.parse(sortedFunds))
        } catch (error) {
            console.error('Failed to fetch funds:', error);
        } finally {
            setIsFetching(false);
        }
    };


    useEffect(()=>{
        console.log('funds1', funds)
    }, [funds])

    const handleSelect = (value: string) => {
        const updatedItems = selectedItems.includes(value)
            ? selectedItems.filter((item: string) => item !== value)
            : [...(selectedItems ?? []), value];
        setSelectedItems(updatedItems);
    };

    if (isFetching) {
        return <div>{t('loading')}</div>;
    }

    return (
        <div className="w-full py-8">
            <ul className="content-gap scrollable snaps-scrollable">
                {funds.map((fund) => {
                    return (
                        <li
                            className={`flex w-full cursor-pointer rounded-md border-primary bg-background shadow-xs hover:border-2 ${selectedItems.includes(fund) ? 'border-2 border-primary' : ''}`}
                            key={fund + Math.random()}
                            onClick={() => handleSelect(fund)}
                            aria-label={fund}
                        >
                            <div className="m-4">
                                <Checkbox
                                    id={fund}
                                    value={fund}
                                    checked={selectedItems.includes(fund)}
                                    onChange={() => {}}
                                    className="text-content-accent mr-2 h-4 w-4 bg-background shadow-xs checked:bg-primary checked:hover:bg-primary focus:border focus:border-primary focus:ring-primary checked:focus:bg-primary"
                                />
                            </div>
                            <div className="m-4 ml-2 w-full">
                                <p className="mb-2 font-medium">{fund}</p>
                                <div className="flex w-full justify-between">
                                    <p className="text-gray-persist">
                                        {t('metric.totalProposals')}
                                    </p>
                                    <p className="font-bold">
                                        {proposalsCount[fund] || 0}
                                    </p>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default FundsFilter;
