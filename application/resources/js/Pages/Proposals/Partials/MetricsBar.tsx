import { useMetrics } from '@/Context/MetricsContext';
import { usePlayer } from '@/Context/PlayerContext';
import { useUIContext } from '@/Context/SharedUIContext';
import { ProposalMetrics } from '@/types/proposal-metrics';
import { currency } from '@/utils/currency';
import { usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// SectionOne displays the first set of data in the MetricsBar
const SectionOne: React.FC<
    Pick<ProposalMetrics, 'submitted' | 'approved' | 'completed'>
> = ({ submitted, approved, completed }) => {
    const { t } = useTranslation();
    return (
        <div className="flex w-full items-center justify-between text-sm md:text-base">
            {!!submitted && (
                <div className="border-dark flex grow flex-col items-center border-r px-2">
                    <span className="content-light block font-semibold">
                        {t('submitted')}
                    </span>
                    <span>{submitted.toLocaleString()}</span>
                </div>
            )}
            {!!approved && (
                <div className="border-dark flex grow flex-col items-center border-r px-2">
                    <span className="text-primary block font-semibold">
                        {t('approved')}
                    </span>
                    <span>{approved.toLocaleString()}</span>
                </div>
            )}
            {!!completed && (
                <div className="flex grow flex-col items-center px-2">
                    <span className="text-success block font-semibold">
                        {t('completed')}
                    </span>
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
        'requestedUSD' | 'requestedADA' | 'awardedUSD' | 'awardedADA'
    >
> = ({ requestedUSD, requestedADA, awardedUSD, awardedADA }) => {
    const { t } = useTranslation();
    return (
        <div className="flex w-full items-center justify-between text-sm md:text-base">
            {!!requestedUSD && (
                <div
                    className={
                        'border-dark flex grow flex-col items-center border-l px-2 ' +
                        (requestedADA || awardedUSD || awardedADA
                            ? ' border-r'
                            : '')
                    }
                >
                    <span className="text-highlight block font-semibold text-nowrap">
                        $ {t('requested')}
                    </span>
                    <span>{currency(requestedUSD)}</span>
                </div>
            )}
            {!!requestedADA && (
                <div
                    className={
                        'border-dark flex grow flex-col items-center px-2' +
                        (!requestedUSD ? ' border-l' : '') +
                        (awardedUSD || awardedADA ? ' border-r' : '')
                    }
                >
                    <span className="text-highlight block font-semibold text-nowrap">
                        ₳ {t('requested')}
                    </span>
                    <span>{currency(requestedADA, 'ADA')}</span>
                </div>
            )}
            {!!awardedUSD && (
                <div
                    className={
                        'border-dark flex grow flex-col items-center px-2' +
                        (!requestedUSD || !requestedADA ? ' border-l' : '') +
                        (!!awardedADA ? ' border-r' : '')
                    }
                >
                    <span className="text-highlight block font-semibold text-nowrap">
                        $ {t('awarded')}
                    </span>
                    <span>{currency(awardedUSD)}</span>
                </div>
            )}
            {!!awardedADA && (
                <div
                    className={
                        'flex grow flex-col items-center px-2' +
                        (!requestedUSD || !requestedADA || !requestedUSD
                            ? ' border-l'
                            : '')
                    }
                >
                    <span className="text-highlight block font-semibold text-nowrap">
                        ₳ {t('awarded')}
                    </span>
                    <span>{currency(awardedADA, 'ADA')}</span>
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
                className={`bg-bg-dark sticky inset-x-0 bottom-0 mx-auto flex items-center justify-between overflow-hidden rounded-xl px-4 py-3 text-white shadow-lg transition-all duration-300 ${
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
                                requestedUSD={metrics?.requestedUSD}
                                requestedADA={metrics?.requestedADA}
                                awardedUSD={metrics?.awardedUSD}
                                awardedADA={metrics?.awardedADA}
                            />
                        </div>
                    </div>
                )}
            </div>
        )
    );
};

export default MetricsBar;
