import Checkbox from '@/Components/Checkbox';
import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FundsData = App.DataTransferObjects.FundData;

interface FundFiltersProps {
    selectedItems: any;
    setSelectedItems: (updatedItems: any) => void;
    funds: FundsData[];
}

const FundsFilter: React.FC<FundFiltersProps> = ({
    selectedItems = [],
    setSelectedItems,
    funds,
}) => {
    const { t } = useTranslation();
    const [isActive, setIsActive] = useState(false);

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        // Safeguard: ensure selectedItems is always an array
        const currentItems = Array.isArray(selectedItems) ? selectedItems : [];

        const updatedItems = checked
            ? [...currentItems, value] // Add the value if checked
            : currentItems.filter((item: string) => item !== value); // Remove the value if unchecked

        setSelectedItems(updatedItems);

        // Debugging log
        console.log('Updated selectedItems:', updatedItems);
    };

    const fundFilters = Object.entries(funds).map(([key, value]) => {
        return { title: key, proposalCount: value };
    });

    const sortedFundFilters = fundFilters.sort((a, b) => {
        const numA = parseInt(a.title.split(' ')[1], 10);
        const numB = parseInt(b.title.split(' ')[1], 10);
        return numB - numA;
    });

    return (
        <div className="w-full py-8">
            <ul className="content-gap scrollable snaps-scrollable">
                {sortedFundFilters.map((fund) => {
                    return (
                        <li
                            className={`flex w-full rounded-md bg-background shadow-sm ${selectedItems.includes(fund.title) ? 'border-2 border-primary' : ''}`}
                            key={fund.title}
                        >
                            <div className="m-4">
                                <Checkbox
                                    id={fund.title}
                                    value={fund.title}
                                    checked={selectedItems.includes(fund.title)}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                            <div className="m-4 ml-2 w-full">
                                <p className="mb-2 font-medium">{fund.title}</p>
                                <div className="flex w-full justify-between">
                                    <p className="text-gray-persist">
                                        {t('proposals.totalProposals')}
                                    </p>
                                    <p className="font-bold">
                                        {fund.proposalCount.toLocaleString()}
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
