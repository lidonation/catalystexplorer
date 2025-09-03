import ValueLabel from '@/Components/atoms/ValueLabel';
import { useMetrics } from '@/Context/MetricsContext';
import { useUIContext } from '@/Context/SharedUIContext';
import { ProposalMetrics } from '@/types/proposal-metrics';
import { currency } from '@/utils/currency';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState } from 'react';

// SectionOne displays the first set of data in the MetricsBar
const SectionOne: React.FC<
    Pick<ProposalMetrics, 'submitted' | 'approved' | 'completed'>
> = ({ submitted, approved, completed }) => {
    const { t } = useLaravelReactI18n();
    return (
        <div
            className="divide-dark flex w-full items-center justify-between divide-x text-sm md:text-base"
            data-testid="metrics-bar-section-one"
        >
            {!!submitted && (
                <div className="flex grow flex-col items-center px-2">
                    <ValueLabel
                        className="content-light block font-semibold"
                        data-testid="metrics-bar-submitted-label"
                    >
                        {t('submitted')}
                    </ValueLabel>
                    <span data-testid="metrics-bar-submitted-value">
                        {submitted.toLocaleString()}
                    </span>
                </div>
            )}
            {!!approved && (
                <div className="flex grow flex-col items-center px-2">
                    <ValueLabel
                        className="text-primary block font-semibold"
                        data-testid="metrics-bar-approved-label"
                    >
                        {t('approved')}
                    </ValueLabel>
                    <span data-testid="metrics-bar-approved-value">
                        {approved.toLocaleString()}
                    </span>
                </div>
            )}
            {!!completed && (
                <div className="flex grow flex-col items-center px-2">
                    <ValueLabel
                        className="text-success block font-semibold"
                        data-testid="metrics-bar-completed-label"
                    >
                        {t('completed')}
                    </ValueLabel>
                    <span data-testid="metrics-bar-completed-value">
                        {completed.toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
};

// SectionTwo displays the second set of data in the MetricsBar
const SectionTwo: React.FC<
    Pick<
        ProposalMetrics,
        | 'requestedUSD'
        | 'requestedADA'
        | 'distributedUSD'
        | 'distributedADA'
        | 'awardedUSD'
        | 'awardedADA'
    >
> = ({
    distributedUSD,
    distributedADA,
    awardedUSD,
    awardedADA,
    requestedUSD,
    requestedADA,
}) => {
    const { t } = useLaravelReactI18n();
    return (
        <div
            className="divide-dark flex w-full items-center justify-between divide-x text-sm md:text-base"
            data-testid="metrics-bar-section-two"
        >
            {!!distributedUSD && (
                <div className={'flex grow flex-col items-center px-2'}>
                    <ValueLabel
                        className="block text-nowrap"
                        data-testid="metrics-bar-distributed-usd-label"
                    >
                        $ {t('distributed')}
                    </ValueLabel>
                    <span data-testid="metrics-bar-distributed-usd-value">
                        {currency(distributedUSD)}
                    </span>
                </div>
            )}
            {!!distributedADA && (
                <div className={'flex grow flex-col items-center px-2'}>
                    <ValueLabel
                        className="block text-nowrap"
                        data-testid="metrics-bar-distributed-ada-label"
                    >
                        ₳ {t('distributed')}
                    </ValueLabel>
                    <span data-testid="metrics-bar-distributed-ada-value">
                        {currency(distributedADA, 2, 'ADA')}
                    </span>
                </div>
            )}

            {!!awardedUSD && (
                <div className={'flex grow flex-col items-center px-2'}>
                    <ValueLabel
                        className="block text-nowrap"
                        data-testid="metrics-bar-awarded-usd-label"
                    >
                        $ {t('awarded')}
                    </ValueLabel>
                    <div
                        className="text-nowrap"
                        data-testid="metrics-bar-awarded-usd-value"
                    >
                        {currency(awardedUSD)}
                    </div>
                </div>
            )}
            {!!awardedADA && (
                <div className={'flex grow flex-col items-center px-2'}>
                    <ValueLabel
                        className="block text-nowrap"
                        data-testid="metrics-bar-awarded-ada-label"
                    >
                        ₳ {t('awarded')}
                    </ValueLabel>
                    <div
                        className="text-nowrap"
                        data-testid="metrics-bar-awarded-ada-value"
                    >
                        {currency(awardedADA, 2, 'ADA')}
                    </div>
                </div>
            )}

            {!!requestedUSD && (
                <div className={'flex grow flex-col items-center px-2'}>
                    <ValueLabel
                        className="block text-nowrap"
                        data-testid="metrics-bar-requested-usd-label"
                    >
                        $ {t('requested')}
                    </ValueLabel>
                    <span data-testid="metrics-bar-requested-usd-value">
                        {currency(requestedUSD)}
                    </span>
                </div>
            )}
            {!!requestedADA && (
                <div className={'flex grow flex-col items-center px-2'}>
                    <ValueLabel
                        className="block text-nowrap"
                        data-testid="metrics-bar-requested-ada-label"
                    >
                        ₳ {t('requested')}
                    </ValueLabel>
                    <span data-testid="metrics-bar-requested-ada-value">
                        {currency(requestedADA, 2, 'ADA')}
                    </span>
                </div>
            )}
        </div>
    );
};

// MetricsBar Component that combines SectionOne and SectionTwo
const MetricsBar: React.FC<ProposalMetrics | undefined> = (props) => {
    const { isPlayerBarExpanded } = useUIContext(); // Access the context to manage player bar state
    const [isExpanded, setIsExpanded] = useState(true);
    const { metrics } = useMetrics();
    const onProposals = usePage().component == 'Proposals/Index';

    return (
        metrics &&
        onProposals && (
            <div
                className={`bg-bg-dark divide-dark sticky inset-x-0 bottom-0 z-50 mx-auto mb-4 flex items-center justify-between divide-x overflow-hidden rounded-xl px-4 py-3 text-white shadow-lg transition-all duration-300 ${
                    isExpanded && !isPlayerBarExpanded ? 'w-full' : 'w-auto'
                }`}
                data-testid="metrics-bar-container"
            >
                <div className="flex w-full items-center justify-between">
                    <SectionOne
                        submitted={metrics?.submitted}
                        approved={metrics?.approved}
                        completed={metrics?.completed}
                    />
                </div>
                {isExpanded && !isPlayerBarExpanded && (
                    <div className="hidden w-full items-center md:flex md:space-x-4">
                        <div className="grow items-center transition-all duration-300">
                            <SectionTwo
                                distributedUSD={metrics?.distributedUSD}
                                distributedADA={metrics?.distributedADA}
                                awardedADA={metrics?.awardedADA}
                                awardedUSD={metrics?.awardedUSD}
                                requestedUSD={metrics?.requestedUSD}
                                requestedADA={metrics?.requestedADA}
                            />
                        </div>
                    </div>
                )}
            </div>
        )
    );
};

export default MetricsBar;
