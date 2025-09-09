import Title from '@/Components/atoms/Title';
import Value from '@/Components/atoms/Value';
import DetailRow from '@/Pages/Transactions/Partials/DetailRow';
import { currency } from '@/utils/currency';
import { getTimeSince } from '@/utils/timeSince';
import { formatTimestamp } from '@/utils/timeStamp';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import TransactionData = App.DataTransferObjects.TransactionData;
import CatalystDrepData = App.DataTransferObjects.CatalystDrepData;

interface DrepDetailsCardProps {
    drep: CatalystDrepData;
}

export default function DrepDetailsCard({ drep }: DrepDetailsCardProps) {
    const { t } = useLaravelReactI18n();

    return (
        <div className="bg-background rounded-lg p-6 shadow-sm">
            <Title
                level="3"
                className="text-content border-background-lighter border-b pb-6 font-bold"
            >
                {t('dreps.details')}
            </Title>

            <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2">
                <div className="space-y-6">
                    <DetailRow
                        label={t('dreps.filters.votingPower')}
                        value={currency(drep?.voting_power ?? 0, 2, 'ADA')}
                    />

                    <DetailRow label={t('dreps.drepList.registeredOn')}>
                        <div className="flex-1">
                            <Value className="text-content font-bold">
                                {formatTimestamp(drep?.created_at ?? '')}
                            </Value>
                            <span className="text-gray-persist text-sm">
                                {getTimeSince(drep?.created_at ?? '')}
                            </span>
                        </div>
                    </DetailRow>

                    <DetailRow label={t('dreps.drepList.lastActive')}>
                        <div className="flex-1">
                            <Value className="text-content font-bold">
                                {drep?.last_active ? formatTimestamp(drep?.last_active || '') : 'N/A'}
                            </Value>
                            <span className="text-gray-persist text-sm">
                                {drep?.last_active ? getTimeSince(drep?.last_active || '') : 'N/A'}
                            </span>
                        </div>
                    </DetailRow>

                    <DetailRow label={t('dreps.drepList.delegators')}>
                        <div className="bg-gray-persist/10 border border-gray-persist/30 rounded-md py-1 px-3">
                            {drep?.delegators_count ?? 0}
                        </div>
                    </DetailRow>

                    <DetailRow label={t('dreps.delegationStatus')}>
                        <div
                            className={`flex items-center justify-center rounded border p-1.5 text-sm ${
                                drep.status === 'active'
                                    ? 'text-success border-success/50 bg-success/10'
                                    : 'text-error border-error/50 bg-error/10'
                            }`}
                        >
                            {drep?.status ? drep.status : 'N/A'}
                        </div>
                    </DetailRow>
                </div>
            </div>
        </div>
    );
}
