import Paragraph from '@/Components/atoms/Paragraph';
import CopyableCell from '@/Components/CopyableCell';
import RegisterTwo from '@/Components/svgs/RegisterTwo';
import React from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import TransactionRow from './TransactionRow';
import TransactionData = App.DataTransferObjects.TransactionData;

interface ColumnConfig<T> {
    key: string;
    header: string;
    width?: string;
    render: (item: T) => React.ReactNode;
}

interface WalletTransactionsTableProps {
    transactions: TransactionData[];
}

export const WalletTransactionsTable: React.FC<
    WalletTransactionsTableProps
> = ({ transactions = [] }) => {
    const { t } = useLaravelReactI18n();
    const voterRegistrationTypes = ['cip15', 'cip36'];

    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
    };

    const columns: ColumnConfig<TransactionData>[] = [
        {
            key: 'type',
            header: t('transactions.table.type'),
            render: (tx) => (
                <div className="flex flex-col items-center justify-center space-y-1">
                    {voterRegistrationTypes.includes(
                        tx.json_metadata?.txType,
                    ) ? (
                        <div className="bg-background-lighter flex items-center rounded px-2 py-1">
                            <RegisterTwo
                                width={12}
                                height={12}
                                className="text-gray-persist mr-1"
                            />
                            <Paragraph className="text-gray-persist text-xs font-bold">
                                {t('transactions.table.voterRegistration')}
                            </Paragraph>
                        </div>
                    ) : (
                        <Paragraph size="sm">
                            {tx.json_metadata?.txType}
                        </Paragraph>
                    )}
                </div>
            ),
        },
        {
            key: 'hash',
            header: t('transactions.table.id'),
            render: (tx) => (
                <div className="flex flex-col items-center justify-center space-y-1">
                    <CopyableCell
                        displayText={formatAddress(tx.tx_hash)}
                        fullText={tx.tx_hash}
                        title={t('transactions.table.copyTxHash')}
                    />
                </div>
            ),
        },
        {
            key: 'epoch',
            header: t('transactions.table.epoch'),
            render: (tx) => (
                <Paragraph size="sm" className="text-center">
                    {tx.epoch || '-'}
                </Paragraph>
            ),
        },
        {
            key: 'block',
            header: t('transactions.table.block'),
            render: (tx) => (
                <CopyableCell
                    displayText={formatAddress(tx.block)}
                    fullText={tx.block}
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
                            <th className="p-3">
                                <Paragraph
                                    size="sm"
                                    className="text-content/60 text-left font-medium"
                                >
                                    {t('transactions.table.actions')}
                                </Paragraph>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <TransactionRow
                                key={index}
                                transaction={tx}
                                columns={columns}
                                onViewDetails={() => {
                                    console.log(
                                        t('transactions.table.viewDetails') +
                                            ':',
                                        tx.tx_hash,
                                    );
                                }}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WalletTransactionsTable;
