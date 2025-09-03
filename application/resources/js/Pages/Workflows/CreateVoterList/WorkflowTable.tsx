import { VoteEnum } from '@/enums/votes-enums';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import React from 'react';

interface ColumnDefinition<T> {
    key: string;
    header: string;
    render: (item: T, index: number) => React.ReactNode;
}

interface WorkflowTableProps<T> {
    items: T[];
    columns: ColumnDefinition<T>[];
    emptyMessage?: string;
    votesMap?: Record<string, VoteEnum>;
    emptyState?: {
        context?: string;
        showIcon?: boolean;
    };
}

const formatHeaderText = (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

function WorkflowTable<T>({
    items,
    columns,
    emptyState = { context: 'records', showIcon: true },
}: WorkflowTableProps<T>): React.ReactElement {
    if (!items?.length || !Array.isArray(items)) {
        return <RecordsNotFound showIcon={emptyState.showIcon} />;
    }

    return (
        <div className="px-4 py-4">
            <div className="max-h-[70vh] min-h-[300px] overflow-y-auto rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="text-content border-b border-gray-100 px-4 py-4 text-left text-sm font-medium"
                                >
                                    {formatHeaderText(column.header)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {columns.map((column, colIndex) => {
                                    const isProposalColumn =
                                        column.key === 'title' ||
                                        column.header.toLowerCase() ===
                                            'proposal';
                                    const cellClass = `p-2 border-b border-gray-100 text-content text-nowrap font-normal sm:text-base font-sans ${
                                        isProposalColumn
                                            ? 'max-w-md overflow-hidden text-ellipsis'
                                            : ''
                                    }`;

                                    return (
                                        <td
                                            key={colIndex}
                                            className={cellClass}
                                        >
                                            {column.render(item, rowIndex)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default WorkflowTable;
