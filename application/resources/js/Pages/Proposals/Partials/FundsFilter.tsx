import Checkbox from '@/Components/Checkbox';
import React, { ChangeEvent} from 'react';
import { useTranslation } from 'react-i18next';

interface FundFiltersProps {
    fundTitle: string;
    totalProposals: any;
    selectedItems: any;
    setSelectedItems: (updatedItems: any) => void;
}

const FundsFilter: React.FC<FundFiltersProps> = ({
    fundTitle,
    totalProposals,
    selectedItems = [],
    setSelectedItems,
}) => {
    const { t } = useTranslation();

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        const updatedItems = checked
            ? [...selectedItems, value]
            : selectedItems.filter((item: any) => item !== value);
        setSelectedItems(updatedItems);
    };

    const isActive = selectedItems.includes(fundTitle);

    return (
        <div
            className={`flex w-full rounded-md bg-background shadow-sm ${isActive ? 'border-2 border-primary' : ''}`}
        >
            <div className="m-4">
                <Checkbox
                    id={fundTitle}
                    value={fundTitle}
                    checked={isActive}
                    onChange={handleCheckboxChange}
                />
            </div>
            <div className="m-4 ml-2 w-full">
                <p className="mb-2 font-medium">{fundTitle}</p>
                <div className="flex w-full justify-between">
                    <p className="text-gray-persist">
                        {t('proposals.totalProposals')}
                    </p>
                    <p className="font-bold">
                        {totalProposals.toLocaleString('en-US')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FundsFilter;
