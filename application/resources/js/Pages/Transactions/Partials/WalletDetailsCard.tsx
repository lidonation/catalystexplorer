import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { adaFormat } from '@/utils/adaFormat';
import { t } from 'i18next';
import DetailRow from './DetailRow';
import TransactionData = App.DataTransferObjects.TransactionData;

interface WalletDetailsCardProps {
    transaction?: TransactionData;
    walletStats: {
        all_time_votes: number;
        funds_participated: string[];
    };
    children?: React.ReactNode;
    title?: string;
}

export default function WalletDetailsCard({
    transaction,
    walletStats,
    children,
    title,
}: WalletDetailsCardProps) {
    return (
        <div className="bg-background rounded-lg p-6 shadow-sm">
            <Title
                level="3"
                className="text-content border-gray-200 border-b pb-6 font-bold"
            >
                {title || t('transactions.walletDetails')}
            </Title>

            <div className="pt-4">
                <div className="space-y-6">
                    <DetailRow
                        label={t('transactions.balance')}
                        value={adaFormat(
                            transaction?.json_metadata.controlled_amount ?? '-',
                        )}
                    />

                    <DetailRow
                        label={t('transactions.allTimeVotes')}
                        value={`${walletStats.all_time_votes.toLocaleString()} votes`}
                        background
                    />

                    <DetailRow
                        label={t('transactions.fundsParticipated')}
                        value={walletStats.funds_participated.length ?? 0}
                        background
                    />

                    <DetailRow label={t('transactions.drepStatus')}>
                        <Paragraph
                            className={`rounded-xl px-2 py-1 font-bold ${
                                transaction?.json_metadata.status === 'true'
                                    ? 'bg-success-light text-success border'
                                    : 'bg-error-light text-error border'
                            }`}
                        >
                            {transaction?.json_metadata.status === 'true'
                                ? 'Active'
                                : 'Inactive'}
                        </Paragraph>
                    </DetailRow>

                    {children}
                </div>
            </div>
        </div>
    );
}
