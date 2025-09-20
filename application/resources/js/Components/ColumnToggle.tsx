import React, { useState, useRef, useEffect } from 'react';
import Button from '@/Components/atoms/Button';
import ColumnSelector from '@/Components/ColumnSelector';
import VerticalColumnIcon from '@/Components/svgs/VerticalColumnIcon';
import { useUserSetting } from '@/useHooks/useUserSettings';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface ColumnToggleProps {
    className?: string;
    defaultColumns?: string[];
}

const ColumnToggle: React.FC<ColumnToggleProps> = ({
    className = '',
    defaultColumns = ['title', 'budget', 'category', 'openSourced', 'teams', 'viewProposal']
}) => {
    const { t } = useLaravelReactI18n();

    const {
        value: selectedColumns,
        setValue: setSelectedColumns,
        isLoading
    } = useUserSetting<string[]>(
        userSettingEnums.PROPOSAL_PDF_COLUMNS,
        defaultColumns
    );

    const handleColumnSelectionChange = (columns: string[]) => {
        setSelectedColumns(columns);
    };

    if (isLoading) {
        return null;
    }

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center gap-2">
                <VerticalColumnIcon className="w-4 h-4 text-light-gray-persist" />
                <ColumnSelector
                    selectedColumns={selectedColumns || defaultColumns}
                    onSelectionChange={handleColumnSelectionChange}
                    className="w-80"
                />
            </div>
        </div>
    );
};

export default ColumnToggle;
