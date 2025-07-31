import React, { useState, useEffect } from 'react';
import { SearchSelect } from '@/Components/SearchSelect';
import { useFilterContext } from '@/Context/FiltersContext';
import {useLaravelReactI18n} from "laravel-react-i18n";
import { router } from '@inertiajs/react';
import { VoterEnums } from '@/enums/voter-search-enums';

const VoterFilters = () => {
    const { t } = useLaravelReactI18n();
    const { setFilters, getFilter, filters } = useFilterContext();
    const [selectedFund, setSelectedFund] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const statusOptions = [
        { value: 'active', label: t('voter.status.active') },
        { value: 'inactive', label: t('voter.status.inactive') },
        { value: 'pending', label: t('voter.status.pending') },
    ];

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
        const statusFilter = getFilter('status');
        const fundValues = fundFilter ? parseFilterValue(fundFilter) : [];
        const statusValues = statusFilter ? parseFilterValue(statusFilter) : [];
        setSelectedFund(fundValues);
        setSelectedStatus(statusValues);

        setIsInitialized(true);
    }, [filters]);

    const handleFilterUpdate = (param: string, selectedItems: string[] | string) => {
        const items = selectedItems as string[];


         if (param === VoterEnums.FUND) {
            setSelectedFund(items);
        } else if (param === 'status') {
            setSelectedStatus(items);
        }

        const labelText = param === VoterEnums.FUND ? t('funds.fund') : t('voter.table.status');

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
        <div className="bg-background border-dark-light rounded-md border p-4">
            <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                <div className="flex flex-col gap-2 flex-1">
                    <span className="text-gray-persist font-medium">
                        {t('voter.table.latestFund')}
                    </span>
                    <SearchSelect
                        key={'fund-titles'}
                        domain="fundTitles"
                        selected={selectedFund}
                        onChange={(items) => handleFilterUpdate(VoterEnums.FUND, items)}
                        placeholder={t('select', {'Select': 'Select'})}
                        multiple={true}
                        emptyText={t('voter.noFundsAvailable')}
                        valueField={'hash'}
                        labelField={'title'}
                        side={'bottom'}
                    />
                </div>
                 <div className="flex flex-col gap-2 flex-1">
                    <span className="text-gray-persist font-medium">
                        {t('voter.table.status')}
                    </span>
                    <SearchSelect
                        key={'voter-status'}
                        domain="static"
                        selected={selectedStatus}
                        onChange={(items) => handleFilterUpdate('status', items)}
                        placeholder={t('select', {'Select': 'Select'})}
                        multiple={true}
                        emptyText={t('voter.noStatusAvailable')}
                        valueField={'value'}
                        labelField={'label'}
                        side={'bottom'}
                    />
                </div>
            </div>
        </div>
    );
};

export default VoterFilters;
