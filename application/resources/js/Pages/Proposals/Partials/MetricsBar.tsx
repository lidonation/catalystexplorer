import { useMetrics } from '@/Context/MetricsContext';
import { useUIContext } from '@/Context/SharedUIContext';
import { ProposalMetrics } from '@/types/proposal-metrics';
import { currency } from '@/utils/currency';
import { usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ValueLabel from "@/Components/atoms/ValueLabel";

// SectionOne displays the first set of data in the MetricsBar
const SectionOne: React.FC<
    Pick<ProposalMetrics, 'submitted' | 'approved' | 'completed'>
> = ({ submitted, approved, completed }) => {
    const { t } = useTranslation();
    return (
        <div className="flex w-full items-center justify-between text-sm md:text-base divide-x divide-dark">
            {!!submitted && (
                <div className="flex grow flex-col items-center px-2">
                    <ValueLabel className="content-light block font-semibold">
                        {t('submitted')}
                    </ValueLabel>
                    <span>{submitted.toLocaleString()}</span>
                </div>
            )}
            {!!approved && (
                <div className="flex grow flex-col items-center px-2">
                    <ValueLabel className="text-primary block font-semibold">
                        {t('approved')}
                    </ValueLabel>
                    <span>{approved.toLocaleString()}</span>
                </div>
            )}
            {!!completed && (
                <div className="flex grow flex-col items-center px-2">
                    <ValueLabel className="text-success block font-semibold">
                        {t('completed')}
                    </ValueLabel>
                    <span>{completed.toLocaleString()}</span>
                </div>
            )}
        </div>
    );
};

// SectionTwo displays the second set of data in the MetricsBar
const SectionTwo: React.FC<
    Pick<
        ProposalMetrics,
        'requestedUSD' | 'requestedADA' | 'distributedUSD' | 'distributedADA' | 'awardedUSD' | 'awardedADA'
    >
> = ({ distributedUSD, distributedADA, awardedUSD, awardedADA, requestedUSD, requestedADA, }) => {
    const { t } = useTranslation();
    return (
        <div className="flex w-full items-center justify-between text-sm md:text-base divide-x divide-dark">
            {!!distributedUSD && (
                <div
                    className={
                        'flex grow flex-col items-center px-2'
                    }
                >
                    <ValueLabel className="block text-nowrap">
                        $ {t('distributed')}
                    </ValueLabel>
                    <span>{currency(distributedUSD)}</span>
                </div>
            )}
            {!!distributedADA && (
                <div
                    className={
                        'flex grow flex-col items-center px-2'
                    }
                >
                    <ValueLabel className="block text-nowrap">
                        ₳ {t('distributed')}
                    </ValueLabel>
                    <span>{currency(distributedADA, 2, 'ADA')}</span>
                </div>
            )}

            {!!awardedUSD && (
                <div
                    className={
                        'flex grow flex-col items-center px-2'
                    }
                >
                    <ValueLabel className="block text-nowrap">
                        $ {t('awarded')}
                    </ValueLabel>
                    <div className='text-nowrap'>{currency(awardedUSD)}</div>
                </div>
            )}
            {!!awardedADA && (
                <div
                    className={
                        'flex grow flex-col items-center px-2'
                    }
                >
                    <ValueLabel className="block text-nowrap">
                        ₳ {t('awarded')}
                    </ValueLabel>
                    <div className='text-nowrap'>{currency(awardedADA, 2, 'ADA')}</div>
                </div>
            )}


            {!!requestedUSD && (
                <div
                    className={
                        'flex grow flex-col items-center px-2'
                    }
                >
                    <ValueLabel className="block text-nowrap">
                        $ {t('requested')}
                    </ValueLabel>
                    <span>{currency(requestedUSD)}</span>
                </div>
            )}
            {!!requestedADA && (
                <div
                    className={
                        'flex grow flex-col items-center px-2'
                    }
                >
                    <ValueLabel className="block text-nowrap">
                        ₳ {t('requested')}
                    </ValueLabel>
                    <span>{currency(requestedADA, 2, 'ADA')}</span>
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
    const onProposals = (usePage().component) == 'Proposals/Index';

    return (
        metrics &&
        onProposals && (
            <div
                className={`bg-bg-dark sticky divide-x divide-dark inset-x-0 bottom-0 mx-auto flex items-center justify-between overflow-hidden rounded-xl px-4 py-3 text-white shadow-lg transition-all duration-300 mb-4 ${
                    isExpanded && !isPlayerBarExpanded ? 'w-full' : 'w-auto'
                }`}
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
