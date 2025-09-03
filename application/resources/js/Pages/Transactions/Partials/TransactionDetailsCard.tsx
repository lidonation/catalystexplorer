import Title from '@/Components/atoms/Title';
import Value from '@/Components/atoms/Value';
import { copyToClipboard } from '@/utils/copyClipboard';
import { getTimeSince } from '@/utils/timeSince';
import { formatTimestamp } from '@/utils/timeStamp';
import { truncateMiddle } from '@/utils/truncateMiddle';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CopyIcon } from 'lucide-react';
import DetailRow from './DetailRow';
import TransactionData = App.DataTransferObjects.TransactionData;

interface TransactionDetailsCardProps {
    transaction: TransactionData;
}

export default function TransactionDetailsCard({
    transaction,
}: TransactionDetailsCardProps) {
    const { t } = useLaravelReactI18n();

    const delegations = Array.isArray(
        transaction.json_metadata?.voter_delegations,
    )
        ? transaction.json_metadata.voter_delegations
        : [];
    console.log({ transaction });

    return (
        <div className="bg-background rounded-lg p-6">
            <Title
                level="3"
                className="text-content border-background-lighter border-b pb-6 font-bold"
            >
                {t('transactions.details')}
            </Title>

            <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2">
                <div className="space-y-6">
                    <DetailRow
                        label={t('transactions.table.id')}
                        value={transaction.id}
                        copyable
                    />

                    <DetailRow label={t('transactions.block')}>
                        <div className="flex flex-1 items-center">
                            <Value className="text-content mr-2 max-w-xs truncate font-bold">
                                {truncateMiddle(transaction.block)}
                            </Value>
                            <CopyIcon
                                className="h-4 w-4 cursor-pointer text-gray-400"
                                onClick={() =>
                                    copyToClipboard(transaction.block)
                                }
                            />
                        </div>
                    </DetailRow>

                    <DetailRow label={t('vote.table.timestamp')}>
                        <div className="flex-1">
                            <Value className="text-content font-bold">
                                {formatTimestamp(transaction.created_at)}
                            </Value>
                            <span className="text-gray-persist text-sm">
                                {getTimeSince(transaction.created_at)}
                            </span>
                        </div>
                    </DetailRow>

                    {
                        <DetailRow
                            label={t('transactions.table.epoch')}
                            value={transaction?.epoch}
                        />
                    }
                </div>

                <div className="space-y-6">
                    <DetailRow label={t('transactions.delegations')}>
                        <div className="flex-1">
                            <div className="mb-2 flex items-center">
                                <Value className="bg-background-lighter text-content mr-2 rounded px-2 py-1 text-sm font-bold">
                                    {delegations.length}
                                </Value>
                            </div>
                            {delegations.map(
                                (
                                    delegation: { voting_key: string },
                                    index: number,
                                ) => (
                                    <div
                                        key={index}
                                        className="mb-1 flex items-center"
                                    >
                                        <Value className="text-content font-bold">
                                            {truncateMiddle(
                                                delegation.voting_key,
                                                10,
                                                6,
                                            )}
                                        </Value>
                                        <CopyIcon
                                            className="text-gray-persist ml-2 h-4 w-4 cursor-pointer"
                                            onClick={() =>
                                                copyToClipboard(
                                                    delegation.voting_key,
                                                )
                                            }
                                        />
                                    </div>
                                ),
                            )}
                        </div>
                    </DetailRow>

                    <DetailRow
                        label={t('transactions.nonce')}
                        value={transaction.json_metadata.nonce}
                    />

                    <DetailRow
                        label={t('transactions.witness')}
                        value={
                            transaction.witness
                                ? truncateMiddle(transaction.witness)
                                : '-'
                        }
                    />
                </div>
            </div>
        </div>
    );
}
