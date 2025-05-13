import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Value from '@/Components/atoms/Value';
import { adaFormat } from '@/utils/adaFormat';
import { copyToClipboard } from '@/utils/copyClipboard';
import { truncateMiddle } from '@/utils/truncateMiddle';
import { t } from 'i18next';
import { CopyIcon } from 'lucide-react';
import DetailRow from './DetailRow';
import TransactionData = App.DataTransferObjects.TransactionData;

interface WalletDetailsCardProps {
    transaction: TransactionData;
    walletStats: {
        all_time_votes: number;
        funds_participated: string[];
    };
}

export default function WalletDetailsCard({
    transaction,
    walletStats,
}: WalletDetailsCardProps) {
    return (
        <div className="bg-background rounded-lg p-6">
            <Title
                level="3"
                className="text-content border-background-lighter border-b pb-6 font-bold"
            >
                {t('transactions.walletDetails')}
            </Title>

            <div className="pt-4">
                <div className="space-y-6">
                    <DetailRow
                        label={t('transactions.balance')}
                        value={adaFormat(
                            transaction.json_metadata.controlled_amount,
                        )}
                    />

                    <DetailRow
                        label={t('transactions.allTimeVotes')}
                        value={`${walletStats.all_time_votes} votes`}
                        background
                    />

                    <DetailRow
                        label={t('transactions.fundsParticipated')}
                        value={walletStats.funds_participated.length}
                        background
                    />

                    <DetailRow label={t('transactions.drepStatus')}>
                        <Paragraph
                            className={`rounded-xl px-2 py-1 font-bold ${
                                transaction.json_metadata.status === 'true'
                                    ? 'bg-success-light text-success border'
                                    : 'bg-error-light text-error border'
                            }`}
                        >
                            {transaction.json_metadata.status === 'true'
                                ? 'Active'
                                : 'Inactive'}
                        </Paragraph>
                    </DetailRow>

                    <DetailRow label={t('transactions.stakePub')}>
                        <div className="flex flex-1 items-center">
                            <Value className="text-content mr-2 truncate font-bold">
                                {transaction.stake_pub
                                    ? truncateMiddle(transaction.stake_pub)
                                    : ''}
                            </Value>
                            <CopyIcon
                                className="text-gray-persist h-4 w-4 cursor-pointer font-bold"
                                onClick={() =>
                                   transaction.stake_pub
                                    ? copyToClipboard(transaction.stake_pub):''
                                }
                            />
                        </div>
                    </DetailRow>

                    <DetailRow
                        label={t('transactions.paymentAddress')}
                        className="border-none"
                    >
                        <div className="flex flex-1 items-center">
                            <Value className="text-content mr-2 truncate font-bold">
                                {truncateMiddle(
                                    transaction.json_metadata.payment_address,
                                )}
                            </Value>
                            <CopyIcon
                                className="text-gray-persist h-4 w-4 cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(
                                        transaction.json_metadata
                                            .payment_address,
                                    )
                                }
                            />
                        </div>
                    </DetailRow>

                    <Button className="text-primary">
                        {t('transactions.view')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
