import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';

interface Proposal extends Record<string, unknown> {
    group: App.DataTransferObjects.GroupData;
}

export default function GroupFundingPercentages({ group }: Proposal) {
    const { t } = useTranslation();
    const calculatePercentage = (
        numerator: number,
        denominator: number,
    ): number =>
        denominator > 0 ? Math.ceil((numerator / denominator) * 100) : 0;

    // Component Rendering
    return (
        <div
            className={`grid ${group?.amount_distributed_usd ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}
        >
            <div>
                <div className="flex items-baseline justify-between gap-2">
                    <div className="bg-content-light mt-2 h-2 w-full overflow-hidden rounded-full">
                        <div
                            className={`bg-primary h-full rounded-full`}
                            role="progressbar"
                            aria-label="funds recieved"
                            aria-valuenow={calculatePercentage(
                                group?.amount_distributed_ada,
                                group?.amount_awarded_ada,
                            )}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            style={{
                                width: `${calculatePercentage(group?.amount_distributed_ada, group?.amount_awarded_ada)}%`,
                            }}
                        ></div>
                    </div>
                </div>
                <div className="mt-2 flex justify-between">
                    {group?.amount_distributed_usd <= 0 && (
                        <p>{t('groups.received')}</p>
                    )}
                    <div>
                        <div>
                            <span className="text-lg font-semibold">
                                {currency(
                                    group?.amount_distributed_ada ?? 0,
                                    'ADA',
                                )}
                            </span>
                            <span className="text-highlight text-sm">{`/ ${group?.amount_awarded_ada ?? 0} (${calculatePercentage(group?.amount_distributed_ada, group?.amount_awarded_ada)}%)`}</span>
                        </div>
                    </div>
                </div>
            </div>
            {group?.amount_distributed_usd > 0 && (
                <div>
                    <div className="flex items-baseline justify-between gap-2">
                        <div className="bg-content-light mt-2 h-2 w-full overflow-hidden rounded-full">
                            <div
                                className={`bg-primary h-full rounded-full`}
                                role="progressbar"
                                aria-label="funds recieved"
                                aria-valuenow={calculatePercentage(
                                    group?.amount_distributed_usd,
                                    group?.amount_awarded_usd,
                                )}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{
                                    width: `${calculatePercentage(group?.amount_distributed_usd, group?.amount_awarded_usd)}%`,
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
                            <span className="text-highlight text-sm">{`/ ${currency(group?.amount_awarded_usd ?? 0, 'USD')} (${calculatePercentage(group?.amount_distributed_usd, group?.amount_awarded_usd)}%)`}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
