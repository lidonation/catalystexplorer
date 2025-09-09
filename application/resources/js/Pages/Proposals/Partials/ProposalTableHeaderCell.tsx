import Paragraph from '@/Components/atoms/Paragraph';
import ArrowDownIcon from '@/Components/svgs/ArrowDownIcon';
import ArrowUpIcon from '@/Components/svgs/ArrowUpIcon';
import React from 'react';

interface TableHeaderCellProps {
    label: string | React.ReactNode;
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc' | null;
    onSort?: () => void;
    isLastColumn?: boolean;
    alignment?: 'left' | 'center' | 'right';
    textColorClass?: string;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
    label,
    sortable = false,
    sortDirection = null,
    onSort,
    isLastColumn = false,
    alignment = 'left',
    textColorClass = 'text-content/60',
}) => {
    const justifyClass = alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start';

    return (
        <div
            className={`flex cursor-pointer items-center ${justifyClass} gap-1`}
            onClick={sortable ? onSort : undefined}
            data-testid="table-header-cell"
        >
        {typeof label === 'string' ? (
            <Paragraph
                size="sm"
                className={`text-left font-medium text-nowrap ${textColorClass}`}
                data-testid="table-header-label"
            >
                {label}
            </Paragraph>
        ) : (
            <div
                className={`text-left font-medium text-nowrap ${textColorClass}`}
                data-testid="table-header-label-element"
            >
                {label}
            </div>
        )}
        {sortable && (
            <div
                className="flex-col gap-2"
                data-testid="table-header-sort-icons"
            >
                <ArrowUpIcon
                    width={8}
                    height={6}
                    className={
                        sortDirection === 'asc'
                            ? 'text-primary'
                            : textColorClass
                    }
                    data-testid="table-header-sort-up"
                />
                <ArrowDownIcon
                    width={8}
                    height={5}
                    className={
                        sortDirection === 'desc'
                            ? 'text-primary'
                            : textColorClass
                    }
                    data-testid="table-header-sort-down"
                />
            </div>
        )}
        </div>
    );
};

export default TableHeaderCell;
