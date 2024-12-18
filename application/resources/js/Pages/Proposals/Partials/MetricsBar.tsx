import { useUIContext } from '@/Context/SharedUIContext';
import { ProposalMetrics } from '@/types/proposal-metrics';
import { currency } from '@/utils/currency';
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
              <div className="flex flex-grow flex-col items-center border-r border-dark px-2">
                  <span className="content-light block font-semibold">
                      {t('submitted')}
                  </span>
                  <span>{submitted.toLocaleString()}</span>
              </div>
          )}
          {!!approved && (
              <div className="flex flex-grow flex-col items-center border-r border-dark px-2">
                  <span className="block font-semibold text-primary">
                      {t('approved')}
                  </span>
                  <span>{approved.toLocaleString()}</span>
              </div>
          )}
          {!!completed && (
              <div className="flex flex-grow flex-col items-center px-2">
                  <span className="block font-semibold text-success">
                      {t('completed')}
                  </span>
                  <span>{completed.toLocaleString()}</span>
              </div>
          )}
      </div>
  );}

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
                        'flex flex-grow flex-col items-center border-l border-dark px-2 ' +
                        (requestedADA || awardedUSD || awardedADA
                            ? ' border-r'
                            : '')
                    }
                >
                    <span className="block text-nowrap font-semibold text-highlight">
                        $ {t('requested')}
                    </span>
                    <span>{currency(requestedUSD)}</span>
                </div>
            )}
            {!!requestedADA && (
                <div
                    className={
                        'flex flex-grow flex-col items-center border-dark px-2' +
                        (!requestedUSD ? ' border-l' : '') +
                        (awardedUSD || awardedADA ? ' border-r' : '')
                    }
                >
                    <span className="block text-nowrap font-semibold text-highlight">
                        ₳ {t('requested')}
                    </span>
                    <span>{currency(requestedADA, 'ADA')}</span>
                </div>
            )}
            {!!awardedUSD && (
                <div
                    className={
                        'flex flex-grow flex-col items-center border-dark px-2' +
                        (!requestedUSD || !requestedADA ? ' border-l' : '') +
                        (!!awardedADA ? ' border-r' : '')
                    }
                >
                    <span className="block text-nowrap font-semibold text-highlight">
                        $ {t('awarded')}
                    </span>
                    <span>{currency(awardedUSD)}</span>
                </div>
            )}
            {!!awardedADA && (
                <div
                    className={
                        'flex flex-grow flex-col items-center px-2' +
                        (!requestedUSD || !requestedADA || !requestedUSD
                            ? ' border-l'
                            : '')
                    }
                >
                    <span className="block text-nowrap font-semibold text-highlight">
                        ₳ {t('awarded')}
                    </span>
                    <span>{currency(awardedADA, 'ADA')}</span>
                </div>
            )}
        </div>
    );
};

// MetricsBar Component that combines SectionOne and SectionTwo
const MetricsBar: React.FC<ProposalMetrics> = (props) => {
    const { isPlayerBarExpanded } = useUIContext(); // Access the context to manage player bar state
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div
            className={`sticky inset-x-0 bottom-0 mx-auto flex items-center justify-between overflow-hidden rounded-xl bg-bg-dark px-4 py-3 text-white shadow-lg transition-all duration-300 ${
                isExpanded && !isPlayerBarExpanded ? 'w-full' : 'w-auto'
            }`}
        >
            <div className="flex w-full items-center justify-between">
                <SectionOne
                    submitted={props.submitted}
                    approved={props.approved}
                    completed={props.completed}
                />
            </div>
            {isExpanded && !isPlayerBarExpanded && (
                <div className="hidden w-full items-center md:flex md:space-x-4">
                    <div className="flex-grow items-center transition-all duration-300">
                        <SectionTwo
                            requestedUSD={props.requestedUSD}
                            requestedADA={props.requestedADA}
                            awardedUSD={props.awardedUSD}
                            awardedADA={props.awardedADA}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetricsBar;
