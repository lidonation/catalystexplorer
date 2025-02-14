import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import Paragraph from '@/Components/atoms/Paragraph';

interface GroupFundingPercentagesProps extends Record<string, unknown> {
    group: App.DataTransferObjects.GroupData;
}

export default function GroupFundingPercentages({
    group,
}: GroupFundingPercentagesProps) {
    const { t } = useTranslation();
    const calculatePercentage = (
        numerator: number,
        denominator: number,
    ): number =>
        denominator > 0 ? Math.ceil((numerator / denominator) * 100) : 0;

    return (
        <div>
            {/* First progress bar */}
            <div className="border-content-light grid grid-cols-2 gap-2 border-b pt-4 pb-4">
                <div>
                    <div className="flex items-baseline justify-between gap-2">
                        <div className="bg-content-light mt-2 h-2 w-full overflow-hidden rounded-full">
                            <div
                                className={`bg-eye-logo h-full rounded-full`}
                                role="progressbar"
                                aria-label="funds received"
                                aria-valuenow={calculatePercentage(
                                    group?.amount_awarded_ada ?? 0,
                                    group?.amount_requested_ada ?? 0,
                                )}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{
                                    width: `${calculatePercentage(group?.amount_awarded_ada ?? 0, group?.amount_requested_ada ?? 0)}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                        <div>
                            <div>
                                <span className="text-lg font-semibold">
                                    {currency(
                                        group?.amount_awarded_ada ?? 0,
                                        'ADA',
                                    )}
                                </span>
                                <span className="text-highlight text-sm">{`/ ${group?.amount_requested_ada ?? 0} (${calculatePercentage(group?.amount_awarded_ada ?? 0, group?.amount_requested_ada ?? 0)}%)`}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-baseline justify-between gap-2">
                        <div className="bg-content-light mt-2 h-2 w-full overflow-hidden rounded-full">
                            <div
                                className={`bg-primary h-full rounded-full`}
                                role="progressbar"
                                aria-label="funds received"
                                aria-valuenow={calculatePercentage(
                                    group?.amount_awarded_usd ?? 0,
                                    group?.amount_requested_usd ?? 0,
                                )}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{
                                    width: `${calculatePercentage(group?.amount_awarded_usd ?? 0, group?.amount_requested_usd ?? 0)}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                        <div>
                            <span className="text-lg font-semibold">
                                {currency(
                                    group?.amount_awarded_usd ?? 0,
                                    'USD',
                                )}
                            </span>
                            <span className="text-highlight text-sm">{`/ ${currency(group?.amount_requested_usd ?? 0, 'USD')} (${calculatePercentage(group?.amount_awarded_usd ?? 0, group?.amount_requested_usd ?? 0)}%)`}</span>
                        </div>
                    </div>
                </div>
                <Paragraph className="text-3 text-gray-persist">
                    {t('groups.awardedVsRequested')}
                </Paragraph>
            </div>

            {/* Second Progress Bar */}
            <div className="border-content-light grid grid-cols-2 gap-2 border-b pt-4 pb-4">
                <div>
                    <div className="flex items-baseline justify-between gap-2">
                        <div className="bg-content-light mt-2 h-2 w-full overflow-hidden rounded-full">
                            <div
                                className={`bg-eye-logo h-full rounded-full`}
                                role="progressbar"
                                aria-label="funds received"
                                aria-valuenow={calculatePercentage(
                                    group?.amount_distributed_ada ?? 0,
                                    group?.amount_awarded_ada ?? 0,
                                )}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{
                                    width: `${calculatePercentage(group?.amount_distributed_ada ?? 0, group?.amount_awarded_ada ?? 0)}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                        {(group?.amount_distributed_usd ?? 0) <= 0 && (
                            <Paragraph>{t('groups.received')}</Paragraph>
                        )}
                        <div>
                            <div>
                                <span className="text-lg font-semibold">
                                    {currency(
                                        group?.amount_distributed_ada ?? 0,
                                        'ADA',
                                    )}
                                </span>
                                <span className="text-highlight text-sm">{`/ ${group?.amount_awarded_ada ?? 0} (${calculatePercentage(group?.amount_distributed_ada ?? 0, group?.amount_awarded_ada ?? 0)}%)`}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-baseline justify-between gap-2">
                        <div className="bg-content-light mt-2 h-2 w-full overflow-hidden rounded-full">
                            <div
                                className={`bg-primary h-full rounded-full`}
                                role="progressbar"
                                aria-label="funds received"
                                aria-valuenow={calculatePercentage(
                                    group?.amount_distributed_usd ?? 0,
                                    group?.amount_awarded_usd ?? 0,
                                )}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{
                                    width: `${calculatePercentage(group?.amount_distributed_usd ?? 0, group?.amount_awarded_usd ?? 0)}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                        <div>
                            <span className="text-lg font-semibold">
                                {currency(
                                    group?.amount_distributed_usd ?? 0,
                                    'USD',
                                )}
                            </span>
                            <span className="text-highlight text-sm">{`/ ${currency(group?.amount_awarded_usd ?? 0, 'USD')} (${calculatePercentage(group?.amount_distributed_usd ?? 0, group?.amount_awarded_usd ?? 0)}%)`}</span>
                        </div>
                    </div>
                </div>
                <Paragraph className="text-3 text-gray-persist">
                    {t('groups.receivedVsAwarded')}
                </Paragraph>
            </div>
        </div>
    );
}