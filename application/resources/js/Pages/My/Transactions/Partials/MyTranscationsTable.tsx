import Paragraph from '@/Components/atoms/Paragraph';
import CopyableCell from '@/Components/CopyableCell';
import RegisterTwo from '@/Components/svgs/RegisterTwo';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import MyTransactionRow from './MyTransactionRow';
import TransactionData = App.DataTransferObjects.TransactionData;

interface ColumnConfig<T> {
    key: string;
    header: string;
    width?: string;
    render: (item: T) => React.ReactNode;
}

interface MyTransactionTableProps {
    transactions: TransactionData[];
}

export const MyTransactionTable: React.FC<MyTransactionTableProps> = ({
    transactions = [],
}) => {
    const { CardanoWasm } = useConnectWallet();
    const { t } = useLaravelReactI18n();
    const voterRegistrationTypes = ['cip15', 'cip36'];

    const getStakeAddress = (address: string): string => {
        if (!CardanoWasm || !address) return '';
        try {
            const addr = CardanoWasm.Address.from_bech32(address);
            const baseAddr = CardanoWasm.BaseAddress.from_address(addr);
            if (!baseAddr) return '';
            const stakeCredential = baseAddr.stake_cred();
            if (!stakeCredential) return '';
            const stakeAddress = CardanoWasm.RewardAddress.new(
                addr.network_id(),
                stakeCredential,
            )
                .to_address()
                .to_bech32();
            return stakeAddress;
        } catch (error) {
            console.error('Error extracting stake address:', error);
            return '';
        }
    };

    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
    };

    const columns: ColumnConfig<TransactionData>[] = [
        {
            key: 'id',
            header: t('transactions.table.id'),
            render: (tx) => (
                <div className="flex flex-col items-center space-y-1">
                    <CopyableCell
                        displayText={formatAddress(tx.tx_hash)}
                        fullText={tx.tx_hash}
                        title={t('transactions.table.copyTxHash')}
                    />
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
            key: 'stakeAddress',
            header: t('transactions.table.stakeAddress'),
            render: (tx) => {
                const stakeAddress = getStakeAddress(
                    tx.inputs[0]?.address || '',
                );
                return (
                    <CopyableCell
                        displayText={formatAddress(stakeAddress)}
                        fullText={stakeAddress}
                        title={t('transactions.table.copyStakeAddress')}
                    />
                );
            },
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
        <div className="overflow-x-auto">
            <div className="border-background-lighter inline-block min-w-full overflow-hidden border-t border-r border-l">
                <table className="bg-background min-w-full table-fixed">
                    <thead>
                        <tr className="border-background-lighter border-b">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="border-background-lighter border-r p-3"
                                >
                                    <Paragraph
                                        size="sm"
                                        className="text-gray-persist text-left font-medium"
                                    >
                                        {column.header}
                                    </Paragraph>
                                </th>
                            ))}
                            <th className="p-3">
                                <Paragraph
                                    size="sm"
                                    className="text-gray-persist text-left font-medium"
                                >
                                    {t('transactions.table.actions')}
                                </Paragraph>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <MyTransactionRow
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

export default MyTransactionTable;
