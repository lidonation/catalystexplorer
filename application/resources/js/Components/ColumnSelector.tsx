import HierarchicalSelector from '@/Components/atoms/HierarchicalSelector';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { generateHierarchicalColumns, validateSelectedColumns } from '@/lib/columnUtils';
import { useMemo } from 'react';
import React from 'react';
import Paragraph from './atoms/Paragraph';

// Legacy type for backward compatibility
export type ColumnKey = string;

interface ColumnSelectorProps {
    selectedColumns: string[];
    onSelectionChange: (columns: string[]) => void;
    className?: string;
    icon?: React.ReactNode;
    iconClassName?: string;
    placeholder?: string;
    excludeColumns?: string[];
    protectedColumns?: string[];
}

export default function ColumnSelector({
    selectedColumns,
    onSelectionChange,
    className = '',
    icon,
    iconClassName = '',
    placeholder,
    excludeColumns,
    protectedColumns,
}: ColumnSelectorProps) {
    const { t } = useLaravelReactI18n();

    const hierarchicalOptions = useMemo(() => 
        generateHierarchicalColumns(t, {
            excludeColumns,
            protectedColumns
        }), 
        [t, excludeColumns, protectedColumns]
    );

    const handleSelectionChange = (newColumns: string[]) => {
        const validatedColumns = validateSelectedColumns(newColumns, hierarchicalOptions);
        onSelectionChange(validatedColumns);
    };

    const defaultPlaceholder = placeholder || t('workflows.voterList.selectColumns');

    const visibleSelectedColumns = useMemo(() => {
        return selectedColumns.filter(column => 
            !excludeColumns?.includes(column)
        );
    }, [selectedColumns, excludeColumns]);

    if (icon) {
        return (
            <div className={`${className}`}>
                <HierarchicalSelector
                    selectedItems={selectedColumns}
                    setSelectedItems={handleSelectionChange}
                    options={hierarchicalOptions}
                    placeholder={defaultPlaceholder}
                    protectedColumns={protectedColumns}
                    data-testid="column-selector"
                    triggerClassName={`p-2 border border-gray-persist/[0.7] hover:border-light-gray-persist hover:bg-light-gray-persist/[0.4] transition-colors duration-200 rounded-md ${iconClassName}`}
                    popoverClassName="w-80"
                    customTrigger={
                        <div className="flex items-center justify-center">
                            {icon}
                            {visibleSelectedColumns.length > 0 && (
                                <div className="ml-1 bg-primary text-white flex items-center justify-center rounded-full w-4 h-4 text-xs">
                                    <Paragraph size='xs'>{visibleSelectedColumns.length}</Paragraph>
                                </div>
                            )}
                        </div>
                    }
                />
            </div>
        );
    }

    // Default behavior - render as regular selector
    return (
        <div className={`${className}`}>
            <HierarchicalSelector
                selectedItems={selectedColumns}
                setSelectedItems={handleSelectionChange}
                options={hierarchicalOptions}
                placeholder={defaultPlaceholder}
                protectedColumns={protectedColumns}
                data-testid="column-selector"
            />
        </div>
    );
}
