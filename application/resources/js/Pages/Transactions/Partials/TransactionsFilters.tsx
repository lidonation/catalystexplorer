import SearchControls from '@/Components/atoms/SearchControls';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import TransactionSortOptions from '@/lib/TransactionSortOptions';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';

const TransactionsFilters = () => {
    const { setFilters, getFilter } = useFilterContext();
    const [showFilters, setShowFilters] = useState(false);
    const { t } = useLaravelReactI18n();

    return (
        <section className="mb-4 w-full">
            <SearchControls
                withFilters={true}
                sortOptions={TransactionSortOptions()}
                onFiltersToggle={setShowFilters}
                searchPlaceholder={t('transactions.searchBar.placeholder')}
            />

            {/* Transaction Type Filter Dropdown */}
            {showFilters && (
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t('transactions.type')}
                    </label>
                    <Selector
                        data-testid="transaction-type-selector"
                        data-testid-button="transaction-type-selector-button"
                        isMultiselect={true}
                        className="mb-4"
                        options={[
                            {
                                value: 'cip36_and_cip15',
                                label: t(
                                    'transactions.table.voterRegistration',
                                ),
                                actualValues: ['cip36', 'cip15'],
                            },
                            {
                                value: 'simple_transfer',
                                label: t('transactions.table.proposalPayout'),
                            },
                        ]}
                        setSelectedItems={(value) => {
                            const selectorOptions = [
                                {
                                    value: 'cip36_and_cip15',
                                    label: t(
                                        'transactions.table.voterRegistration',
                                    ),
                                    actualValues: ['cip36', 'cip15'],
                                },
                                {
                                    value: 'simple_transfer',
                                    label: t(
                                        'transactions.table.proposalPayout',
                                    ),
                                },
                            ];

                            const processedValue = value
                                .map((item: any) => {
                                    const option = selectorOptions.find(
                                        (opt) => opt.value === item,
                                    );
                                    return option?.actualValues || item;
                                })
                                .flat();

                            setFilters({
                                label: t('transactions.type'),
                                value: processedValue,
                                param: ParamsEnum.TRANSACTION_TYPE,
                            });
                        }}
                        selectedItems={(() => {
                            const currentFilter = getFilter(
                                ParamsEnum.TRANSACTION_TYPE,
                            );
                            if (!currentFilter) return [];

                            const selectorOptions = [
                                {
                                    value: 'cip36_and_cip15',
                                    actualValues: ['cip36', 'cip15'],
                                },
                                {
                                    value: 'simple_transfer',
                                    actualValues: ['simple_transfer'],
                                },
                            ];

                            return selectorOptions
                                .filter((option) =>
                                    option.actualValues.some((val) =>
                                        currentFilter.includes(val),
                                    ),
                                )
                                .map((option) => option.value);
                        })()}
                    />
                </div>
            )}
        </section>
    );
};

export default TransactionsFilters;
