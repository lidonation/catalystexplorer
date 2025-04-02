import React, { useState, useEffect } from 'react';
import { SearchSelect } from '@/Components/SearchSelect';
import { useFilterContext } from '@/Context/FiltersContext';
import { VoteEnums } from '@/enums/vote-search-enums';
import { useTranslation } from 'react-i18next';

const VoteFilters = () => {
    const { t } = useTranslation();
    const { setFilters, getFilter, filters } = useFilterContext();
    const [selectedChoice, setSelectedChoice] = useState<string[]>([]);
    const [selectedFund, setSelectedFund] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const parseFilterValue = (value: any): string[] => {
        if (!value) return [];
        
        if (typeof value === 'string') {
            return value.split(',').filter(Boolean);
        }
        
        if (Array.isArray(value)) {
            return value.map(String);
        }
        
        return [String(value)];
    };
    
    useEffect(() => {
        const choiceFilter = getFilter(VoteEnums.CHOICE);
        if (choiceFilter) {
            const choiceValues = parseFilterValue(choiceFilter);
            setSelectedChoice(choiceValues);
        } else {
            setSelectedChoice([]);
        }
        
        const fundFilter = getFilter(VoteEnums.FUND);
        if (fundFilter) {
            const fundValues = parseFilterValue(fundFilter);
            setSelectedFund(fundValues);
        } else {
            setSelectedFund([]);
        }
        
        setIsInitialized(true);
    }, [filters]);
    
    const handleChoiceChange = (selectedItems: string[]) => {
        setSelectedChoice(selectedItems);
        
        const formattedValue = selectedItems.join(',');
        
        setFilters({
            label: 'Choice',
            value: formattedValue,
            param: VoteEnums.CHOICE
        });
    };
    
    const handleFundChange = (selectedItems: string[]) => {
        setSelectedFund(selectedItems);
        
        const formattedValue = selectedItems.join(',');
        
        setFilters({
            label: t('proposals.filters.epoch'),
            value: formattedValue,
            param: VoteEnums.FUND
        });
    };

    return (
        <div className="grid grid-cols-4 gap-4 justify-between">
            <div className="col-span-1 flex flex-col gap-2 pb-4">
                <span className="font-medium">Choice</span>
                <SearchSelect
                    key={'choices'}
                    domain='choices'
                    selected={selectedChoice}
                    onChange={handleChoiceChange}
                    placeholder="Select choice"
                    multiple={true}
                    emptyText="No choices available"
                />
            </div>

            <div className="col-span-1 flex flex-col gap-2 pb-4">
                <span className="font-medium">{t('proposals.filters.epoch')}</span>
                <SearchSelect
                    key={'fund-titles'}
                    domain='fundTitles'
                    selected={selectedFund}
                    onChange={handleFundChange}
                    placeholder="Select epoch"
                    multiple={true}
                    emptyText="No epochs available"
                />
            </div>
        </div>
    );
};

export default VoteFilters;
