import Paragraph from '@/Components/atoms/Paragraph';
import CopyableCell from '@/Components/CopyableCell';
import { currency } from '@/utils/currency';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import CatalystVoteRow from './CatalystVotesRow';
import VoterHistoryData = App.DataTransferObjects.VoterHistoryData;

interface ColumnConfig<T> {
    key: string;
    header: string;
    width?: string;
    render: (item: T) => React.ReactNode;
}

interface CatalystVotesTableProps {
    catalystVotes: VoterHistoryData[];
}

export const CatalystVotesTable: React.FC<CatalystVotesTableProps> = ({
    catalystVotes = [],
}) => {
    const { t } = useLaravelReactI18n();

    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
    };

    const columns: ColumnConfig<VoterHistoryData>[] = [
        {
            key: 'fund',
            header: t('transactions.table.fund'),
            render: (vote) => (
                <div className="flex flex-col items-center space-y-1">
                    <Paragraph size="sm" className="font-semibold">
                        {vote?.snapshot?.fund?.title}
                    </Paragraph>
                </div>
            ),
        },
        {
            key: 'fragment_id',
            header: t('transactions.table.fragmentId'),
            render: (vote) => {
                return (
                    <CopyableCell
                        displayText={formatAddress(vote?.fragment_id || '')}
                        fullText={vote?.fragment_id || ''}
                        title={t('transactions.table.copyStakeAddress')}
                    />
                );
            },
        },
        {
            key: 'caster',
            header: t('transactions.table.caster'),
            render: (vote) => (
                <CopyableCell
                    displayText={formatAddress(vote?.caster || '')}
                    fullText={vote?.caster || ''}
                    title={t('transactions.table.copyBlockHash')}
                />
            ),
        },
        {
            key: 'time',
            header: t('transactions.table.timestamp'),
            render: (vote) => (
                <Paragraph size="sm" className="text-center">
                    {vote?.time || '-'}
                </Paragraph>
            ),
        },
        {
            key: 'choice',
            header: t('transactions.table.choice'),
            render: (vote) => (
                <Paragraph size="sm" className="text-center">
                    {vote?.choice || 0}
                </Paragraph>
            ),
        },
        {
            key: 'voting_power',
            header: t('transactions.table.votingPower'),
            render: (vote) => (
                <Paragraph size="sm" className="text-center font-semibold">
                    {currency(vote?.voting_power ?? 0, 2, 'ADA')}
                </Paragraph>
            ),
        },
        {
            key: 'raw_fragment',
            header: t('transactions.table.rawFragment'),
            render: (vote) => (
                <CopyableCell
                    displayText={formatAddress(vote?.raw_fragment || '')}
                    fullText={vote?.raw_fragment || '-'}
                    title={t('transactions.table.copyBlockHash')}
                />
            ),
        },
    ];

    return (
        <div className="w-full overflow-x-auto rounded-t-lg shadow-[0_-1px_4px_0_rgba(0,0,0,0.05)]">
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
                        {catalystVotes?.map((vote, index) => (
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

export default CatalystVotesTable;
