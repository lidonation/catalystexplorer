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

const getVoteText = (voteType: VoteEnum): string => {
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

const getVoteClass = (voteType: VoteEnum): string => {
    switch(voteType) {
        case VoteEnum.YES:
            return 'bg-green-500 text-white';
        case VoteEnum.NO:
            return 'bg-red-500 text-white';
        case VoteEnum.ABSTAIN:
            return 'bg-orange-400 text-white';
        default:
            return 'bg-gray-200 text-gray-700';
    }
};

const formatHeaderText = (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

function WorkflowTable<T>({
                              items,
                              columns,
                              keyExtractor,
                              votesMap,
                              emptyState = { context: 'records', showIcon: true }
                          }: WorkflowTableProps<T>): React.ReactElement {

    const defaultVoteRender = (item: T, index: number): React.ReactNode => {
        const key = keyExtractor(item);
        if (!votesMap) return null;
        const voteType = votesMap[key];
        return voteType !== undefined ? (
            <span className={`px-4 py-2 inline-flex text-sm font-medium rounded-md ${getVoteClass(voteType)}`}>
                {getVoteText(voteType)}
            </span>
        ) : null;
    };

    const defaultRender = (item: T, columnKey: string, index: number): React.ReactNode => {
        const value = columnKey.split('.').reduce((obj: any, key: string) =>
                obj && obj[key] !== undefined ? obj[key] : undefined,
            item
        );

        if (columnKey === 'title') {
            return typeof value === 'string'
                ? value.replace(/\b\w/g, l => l.toUpperCase())
                : (value ?? '-');
        }

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
        <div className="bg-background rounded-lg overflow-hidden">
            <div className="overflow-x-auto px-4 py-4">
                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className="px-4 py-4 text-left text-sm font-medium text-content border border-gray-100"
                            >
                                {formatHeaderText(column.header)}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {items.data.map((item, rowIndex) => (
                        <tr key={keyExtractor(item)}>
                            {columns.map((column, colIndex) => {
                                const isProposalColumn = column.key === 'title' || column.header.toLowerCase() === 'proposal';
                                const cellClass = `px-2 py-2 border border-gray-100 text-content font-normal sm:text-base font-sans ${
                                    isProposalColumn ? 'max-w-md overflow-hidden text-ellipsis' : ''
                                }`;

                                return (
                                    <td key={colIndex} className={cellClass}>
                                        {column.key === 'index'
                                            ? rowIndex + 1 + ((items.current_page - 1) * items.per_page)
                                            : column.key === 'vote' && votesMap
                                                ? (column.render || defaultVoteRender)(item, rowIndex)
                                                : (column.render || ((item, idx) => defaultRender(item, column.key, idx)))(item, rowIndex)
                                        }
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="px-4">
                <Paginator
                    pagination={items}
                    linkProps={{
                        preserveState: true,
                        preserveScroll: true
                    }}
                />
            </div>
        </div>
    );
}

export default WorkflowTable;
