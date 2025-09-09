import Paragraph from '@/Components/atoms/Paragraph';
import CatalystVoteRow from '@/Pages/Transactions/Partials/CatalystVotesRow';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import VoterHistoryData = App.DataTransferObjects.VoterHistoryData;

interface ColumnConfig<T> {
    key: string;
    header: string;
    width?: string;
    render: (item: T) => React.ReactNode;
}

interface VoterHistoryTableProps {
    votingHistory: VoterHistoryData[];
}

export const VoterHistoryTable: React.FC<VoterHistoryTableProps> = ({
    votingHistory = [],
}) => {
    const { t } = useLaravelReactI18n();

    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
    };

    const columns: ColumnConfig<VoterHistoryData>[] = [
        {
            key: 'proposal_title',
            header: t('vote.votingHistory'),
            render: (vote) => (
                <Paragraph size="sm">{vote?.proposal_title || '-'}</Paragraph>
            ),
        },
        {
            key: 'choice',
            header: t('dreps.vote'),
            render: (vote) => (
                <div
                    className={`flex items-center justify-center rounded border p-1.5 text-sm w-16 ${
                        vote?.choice === 1
                            ? 'text-success border-success/50 bg-success/10'
                            : vote?.choice === 2
                              ? 'text-error border-error/50 bg-error/10'
                              : 'text-primary border-primary/50 bg-primary/10'
                    }`}
                >
                    {vote?.choice === 1
                        ? 'Yes'
                        : vote?.choice === 2
                          ? 'No'
                          : 'Abstain'}
                </div>
            ),
        },
    ];

    return (
        <div className="w-full overflow-x-auto rounded-t-lg shadow-sm">
            <div className="inline-block min-w-full overflow-hidden">
                <table className="min-w-full table-fixed">
                    <thead className="bg-background-lighter border-gray-persist border-b">
                        <tr className="border-background-lighter border-r border-b">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="border-gray-persist/30 border-r p-3 last:border-r-0"
                                >
                                    <Paragraph
                                        size="sm"
                                        className="text-content/60 text-left font-medium"
                                    >
                                        {column.header}
                                    </Paragraph>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {votingHistory?.map((vote, index) => (
                            <CatalystVoteRow
                                key={index}
                                voterHistory={vote}
                                columns={columns}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VoterHistoryTable;
