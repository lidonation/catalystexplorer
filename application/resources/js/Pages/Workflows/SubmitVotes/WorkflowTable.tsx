import React from 'react';
import { VoteEnum } from '@/enums/votes-enums';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import Paginator from '@/Components/Paginator';
import { PaginatedData } from '../../../../types/paginated-data';

interface ColumnDefinition<T> {
    key: string;
    header: string;
    render?: (item: T, index: number) => React.ReactNode;
}

interface WorkflowTableProps<T> {
    items: PaginatedData<T[]>;
    columns: ColumnDefinition<T>[];
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
    votesMap?: Record<string, VoteEnum>;
    emptyState?: {
        context?: string;
        showIcon?: boolean;
    };
}

const getVoteText = (voteType: VoteEnum) => {
    switch(voteType) {
        case VoteEnum.YES:
            return 'Yes';
        case VoteEnum.NO:
            return 'No';
        case VoteEnum.ABSTAIN:
            return 'Abstain';
        default:
            return 'Unknown';
    }
};

const getVoteClass = (voteType: VoteEnum) => {
    switch(voteType) {
        case VoteEnum.YES:
            return 'bg-success text-white';
        case VoteEnum.NO:
            return 'bg-red-100 text-red-800';
        case VoteEnum.ABSTAIN:
            return 'bg-warning text-white';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

function WorkflowTable<T>({
                              items,
                              columns,
                              keyExtractor,
                              votesMap,
                              emptyState = { context: 'records', showIcon: true }
                          }: WorkflowTableProps<T>): React.ReactElement {
    const defaultVoteRender = (item: T, index: number) => {
        const key = keyExtractor(item);
        if (!votesMap) return null;
        const voteType = votesMap[key];
        return voteType !== undefined ? (
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getVoteClass(voteType)}`}>
                {getVoteText(voteType)}
            </span>
        ) : null;
    };

    const defaultRender = (item: T, columnKey: string, index: number) => {
        const value = columnKey.split('.').reduce((obj: any, key: string) =>
                obj && obj[key] !== undefined ? obj[key] : undefined,
            item
        );
        return value ?? '-';
    };

    if (!items?.data || !Array.isArray(items.data) || items.data.length === 0) {
        return (
            <RecordsNotFound
                showIcon={emptyState.showIcon}
            />
        );
    }

    return (
        <div className="rounded-lg  shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="text-content">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`
                                    px-4 py-3 text-left text-xs font-medium text-content uppercase tracking-wider
                                    border-b border-gray-200
                                    ${index < columns.length - 1 ? 'border-r border-gray-200' : ''}
                                `}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {items.data.map((item, index) => (
                        <tr key={keyExtractor(item)} className="text-content">
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`
                                        px-4 py-4 text-sm text-content
                                        ${colIndex < columns.length - 1 ? 'border-r border-gray-200' : ''}
                                    `}
                                >
                                    {column.key === 'index'
                                        ? index + 1 + ((items.current_page - 1) * items.per_page)
                                        : column.key === 'vote' && votesMap
                                            ? (column.render || defaultVoteRender)(item, index)
                                            : (column.render || ((item, index) => defaultRender(item, column.key, index)))(item, index)
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {items.data.length > 0 && (
                <div className="mt-6">
                    <Paginator
                        pagination={items}
                        linkProps={{
                            preserveState: true,
                            preserveScroll: true,
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default WorkflowTable;
