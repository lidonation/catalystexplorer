import React, { useState, useEffect } from 'react';
import { SearchSelect } from '@/Components/SearchSelect';
import { useFilterContext } from '@/Context/FiltersContext';

import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { VoterEnums } from '@/enums/voter-search-enums';

const VoterFilters = () => {
    const { t } = useTranslation();
    const { setFilters, getFilter, filters } = useFilterContext();
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
        const fundFilter = getFilter(VoterEnums.FUND);
        const fundValues = fundFilter ? parseFilterValue(fundFilter) : [];
        setSelectedFund(fundValues);
        
        setIsInitialized(true);
    }, [filters]);
    
    const handleFilterUpdate = (param: string, selectedItems: string[] | string) => {
        const labelText = t('funds.fund');

        const items = selectedItems as string[];
        setSelectedFund(items);
        
        if (items.length === 0) {
            setFilters({
                param: param,
                value: null,
                label: undefined
            });
        } else {
            setFilters({
                param: param,
                value: items,
                label: labelText
            });
        }
    };

    return (
        <div className="bg-background border-dark-light w-full rounded-md border p-4">
            <div className="gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-gray-persist font-medium">
                        {t('voter.table.latestFund')}
                    </span>
                    <SearchSelect
                        key={'fund-titles'}
                        domain="fundTitles"
                        selected={selectedFund}
                        onChange={(items) => handleFilterUpdate(VoterEnums.FUND, items)}
                        placeholder={t('select', 'Select')}
                        multiple={true}
                        emptyText={t('voter.noFundsAvailable')}
                        valueField={'hash'}
                        labelField={'title'}
                        side={'bottom'}
                    />
                </div>
            </div>
        </div>
    );
};

export default VoterFilters;