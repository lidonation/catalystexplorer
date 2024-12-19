import Checkbox from '@/Components/Checkbox';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FundFiltersProps {
    selectedItems: any;
    proposalsCount: { [key: string]: number };
    setSelectedItems: (updatedItems: any) => void;
}

const FundsFilter: React.FC<FundFiltersProps> = ({
    selectedItems = [],
    proposalsCount,
    setSelectedItems,
}) => {
    const { t } = useTranslation();
    const [funds, setFunds] = useState<string[]>([]);

    const fetchFunds = () => {
        axios
            .get(route('api.fund_titles'))
            .then((response) => {
                setFunds(response?.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    funds.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
        const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);

        return numB - numA;
    });

    useEffect(() => {
        fetchFunds();
    }, []);

    const handleSelect = (value: string) => {
        let updatedItems: any;

        if (selectedItems.includes(value)) {
            updatedItems = selectedItems.filter((item: any) => item !== value);
        } else {
            updatedItems = [...(selectedItems ?? []), value];
        }

        setSelectedItems(updatedItems);
    };

    return (
        <div className="w-full py-8">
            <ul className="content-gap scrollable snaps-scrollable">
                {funds.map((fund) => {
                    return (
                        <li
                            className={`flex w-full rounded-md bg-background shadow-sm ${selectedItems.includes(fund) ? 'border-2 border-primary' : ''}`}
                            key={fund}
                            onClick={() => handleSelect(fund)}
                        >
                            <div className="m-4">
                                <Checkbox
                                    id={fund}
                                    value={fund}
                                    checked={selectedItems.includes(fund)}
                                    onChange={() => {}}
                                />
                            </div>
                            <div className="m-4 ml-2 w-full">
                                <p className="mb-2 font-medium">{fund}</p>
                                <div className="flex w-full justify-between">
                                    <p className="text-gray-persist">
                                        {t('proposals.totalProposals')}
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
