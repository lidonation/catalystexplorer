import React, { useState, useEffect } from 'react';
import { SearchSelect } from '@/Components/SearchSelect';
import { useFilterContext } from '@/Context/FiltersContext';
import { VoteEnums } from '@/enums/vote-search-enums';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';

const VoteFilters = () => {
    const { t } = useTranslation();
    const { setFilters, getFilter, filters } = useFilterContext();
    const [selectedChoice, setSelectedChoice] = useState<string[]>([]);
    const [selectedFund, setSelectedFund] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const parseFilterValue = (value: any): string[] => {
        if (value === null || value === undefined) return [];
        
        if (typeof value === 'string') {
            if (value === '') return [];
            
            return value.split(',').filter(Boolean);
        }
        
        if (Array.isArray(value)) {
            return value.map(String);
        }
        
        return [String(value)];
    };
    
    useEffect(() => {
        const choiceFilter = getFilter(VoteEnums.CHOICE);
        const choiceValues = choiceFilter ? parseFilterValue(choiceFilter) : [];
        setSelectedChoice(choiceValues);
        
        const fundFilter = getFilter(VoteEnums.FUND);
        const fundValues = fundFilter ? parseFilterValue(fundFilter) : [];
        setSelectedFund(fundValues);
        
        setIsInitialized(true);
    }, [filters]);
    
    const handleFilterUpdate = (param: string, selectedItems: string[]) => {
        const isChoiceFilter = param === VoteEnums.CHOICE;
        const setter = isChoiceFilter ? setSelectedChoice : setSelectedFund;
        const labelText = isChoiceFilter ? t('vote.choice') : t('funds.fund');

        setter(selectedItems);
        
        if (selectedItems.length === 0) {
            setFilters({
                param: param,
                value: null,
                label: undefined
            });
            
            setTimeout(() => {
                const currentUrl = window.location.pathname;
                const currentParams = new URLSearchParams(window.location.search);
                currentParams.delete(param);
                
                const params: Record<string, string> = {};
                for (const [key, value] of currentParams.entries()) {
                    if (value) {
                        params[key] = value;
                    }
                }
                
                router.get(currentUrl, params, {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['voterHistories', 'filters']
                });
            }, 10);
        } else {
            setFilters({
                param: param,
                value: selectedItems,
                label: labelText
            });
        }
    };
    
    const handleChoiceChange = (selectedItems: string[]) => {
        handleFilterUpdate(VoteEnums.CHOICE, selectedItems);
    };
    
    const handleFundChange = (selectedItems: string[]) => {
        handleFilterUpdate(VoteEnums.FUND, selectedItems);
    };

    return (
        <div className="bg-background border-dark-light w-full rounded-md border p-4">
            <div className="gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-gray-persist font-medium">
                        {t('vote.table.fund')}
                    </span>
                    <SearchSelect
                        key={'fund-titles'}
                        domain="fundTitles"
                        selected={selectedFund}
                        onChange={handleFundChange}
                        placeholder={t('select', 'Select')}
                        multiple={true}
                        emptyText={t('vote.noEpochsAvailable')}
                        valueField={'hash'}
                        labelField={'title'}
                    />
                </div>
            </div>
        </div>
    );
};

export default VoteFilters;
