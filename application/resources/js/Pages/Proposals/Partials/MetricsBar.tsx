import ValueLabel from '@/Components/atoms/ValueLabel';
import PercentageProgressBar from '@/Components/PercentageProgressBar';
import { useMetrics } from '@/Context/MetricsContext';
import { useUIContext } from '@/Context/SharedUIContext';
import { ProposalMetrics } from '@/types/proposal-metrics';
import { currency } from '@/utils/currency';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState } from 'react';
import { shortNumber } from '@/utils/shortNumber';
import ViewAnalyticsButton from '@/Components/atoms/ViewAnalyticsButton';
import MetricBarSvg from '@/Components/svgs/MetricBarSvg';
import AnalyticsView from '@/Pages/Proposals/Partials/AnalyticsView';

// SectionOne displays the first set of data in the MetricsBar
const SectionOne: React.FC<
    Pick<ProposalMetrics, 'submitted' | 'approved' | 'completed'>
> = ({ submitted, approved, completed }) => {
    const { t } = useLaravelReactI18n();
    return (
        <div
            className="divide-dark import Submittedimport SubmittedBarSVG from '@/Components/atoms/SubmittedBarSVG';BarSVG from '@/Components/atoms/SubmittedBarSVG';flex w-full items-center justify-between divide-x text-sm md:text-base"
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
         requestedADA
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

interface MetricsBarProps extends ProposalMetrics {
    isConnected?: boolean;
    isAnimating?: boolean;
}

const MetricsBar: React.FC<MetricsBarProps> = ({ isConnected = false, isAnimating = false }) => {
    const { isPlayerBarExpanded } = useUIContext();
    const [showAnalytics, setShowAnalytics] = useState(false); // Add analytics state
    const { metrics } = useMetrics();
    const onProposals = usePage().component == 'Proposals/Index';
    const { t } = useLaravelReactI18n();

    const borderRadiusClass = isConnected
        ? 'rounded-l-xl rounded-r-none'
        : 'rounded-xl';

    const gradientClass = isConnected
        ? 'bg-gradient-to-r from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)] bg-opacity-90'
        : 'bg-gradient-to-br from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]';

    const toggleAnalytics = () => {
        setShowAnalytics(!showAnalytics);
    };

    return (
        metrics &&
        onProposals && (
            <div
                className={`${gradientClass} overflow-visible ${borderRadiusClass} text-content-light shadow-lg transition-all duration-300 w-full ${
                    isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                } ${showAnalytics && !isConnected ? 'min-h-[400px]' : ''}`}
                data-testid="metrics-bar-container">
                <div className="lg:hidden w-full">
                    {showAnalytics ? (
                        <div className="relative">
                            <AnalyticsView metrics={metrics} isMobile={true} />
                            <div className="flex justify-center pb-4">
                                <ViewAnalyticsButton
                                    onClick={toggleAnalytics}
                                    label="Hide Analytics"
                                    isExpanded={true}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center px-2 py-4 w-full">
                                <div className="w-full max-w-md">
                                    <div className="flex justify-center mb-4 gap-12">
                                        {metrics?.submitted !== undefined && (
                                            <div className="flex flex-col items-center justify-start gap-2 w-28">
                                                <ValueLabel className="text-content-light block font-semibold text-5 uppercase tracking-wide">
                                                    {t('submitted')}
                                                </ValueLabel>
                                                <span className="text-1 font-bold leading-5 ml-8">
                                                    {metrics.submitted.toLocaleString()}
                                                </span>
                                                <MetricBarSvg type="submitted" className="mt-2" />
                                            </div>
                                        )}

                                        {metrics?.approved !== undefined && metrics?.submitted !== undefined && (
                                            <div className="flex flex-col items-center justify-start gap-2 w-28">
                                                <ValueLabel className="text-primary block font-semibold text-5 uppercase tracking-wide">
                                                    {t('approved')}
                                                </ValueLabel>
                                                <span className="text-1 font-bold leading-5 mr-10">
                                                    {metrics.approved.toLocaleString()}
                                                </span>
                                                <div className="inline-flex justify-center items-center gap-1 mt-1">
                                                   <MetricBarSvg type="approved" />
                                                    <div className="text-center justify-start text-success text-sm font-medium font-['Inter'] leading-4">
                                                        {((metrics.approved / metrics.submitted) * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-center mb-4 gap-16">
                                        {metrics?.completed !== undefined && metrics?.submitted !== undefined && (
                                            <div className="flex flex-col items-center justify-start gap-2 w-28">
                                                <ValueLabel className="text-success block font-semibold text-5 uppercase tracking-wide">
                                                    {t('completed')}
                                                </ValueLabel>
                                                <span className="text-xl font-bold leading-5 ml-8">
                                                    {metrics.completed.toLocaleString()}
                                                </span>
                                                <div className="inline-flex justify-center items-center gap-1 mt-1">
                                                    <div className="w-14 scale-y-[0.5]">
                                                        <PercentageProgressBar
                                                            value={metrics.completed}
                                                            total={metrics.submitted}
                                                            primaryBackgroundColor="bg-gray-300"
                                                            secondaryBackgroudColor="bg-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {metrics?.distributedADA !== undefined && (
                                            <div className="flex flex-col items-center justify-start gap-2 w-28">
                                                <ValueLabel className="block text-content-light font-semibold text-5 text-nowrap uppercase tracking-wide">
                                                    ₳ {t('distributed')}
                                                </ValueLabel>
                                                <span className="text-1 font-bold leading-5 mr-12">
                                                    ₳{shortNumber(metrics.distributedADA, 2)}
                                                </span>
                                                {metrics?.distributedUSD !== undefined && metrics.distributedUSD > 0 && (
                                                    <div className="text-content-light text-xs font-medium">
                                                        ${shortNumber(metrics.distributedUSD, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-center mb-4 gap-20">
                                        {metrics?.awardedADA !== undefined && (
                                            <div className="flex flex-col items-center justify-start gap-2 w-28">
                                                <ValueLabel className="text-content-light block font-semibold text-5 text-nowrap uppercase tracking-wide">
                                                    ₳ {t('awarded')}
                                                </ValueLabel>
                                                <span className="text-1 font-bold leading-5 ml-8">
                                                    ₳{shortNumber(metrics.awardedADA, 2)}
                                                </span>
                                                {metrics?.awardedUSD !== undefined && metrics.awardedUSD > 0 && (
                                                    <div className="text-content-light text-xs font-medium">
                                                        ${shortNumber(metrics.awardedUSD, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {metrics?.requestedADA !== undefined && (
                                            <div className="flex flex-col items-center justify-start gap-2 w-28">
                                                <ValueLabel className="text-content-light block font-semibold text-5 text-nowrap uppercase tracking-wide">
                                                    ₳ {t('requested')}
                                                </ValueLabel>
                                                <span className="text-1 font-bold leading-5 mr-12">
                                                    ₳{shortNumber(metrics.requestedADA, 2)}
                                                </span>
                                                {metrics?.requestedUSD !== undefined && metrics.requestedUSD > 0 && (
                                                    <div className="text-content-light text-xs font-medium">
                                                        ${shortNumber(metrics.requestedUSD, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center pb-4 mr-4">
                                <ViewAnalyticsButton
                                    onClick={toggleAnalytics}
                                    label="View Analytics"
                                    isExpanded={false}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden lg:flex lg:flex-col w-full ">
                {showAnalytics && (
                        <div className="relative">
                            <AnalyticsView metrics={metrics} isMobile={false} />
                            <svg
                                className="absolute -right-10 bottom-0"
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ transform: 'scaleX(-1)' }}
                            >
                                <path
                                    d="M40 0 C40 0, 40 40, 0 40 L40 40 Z"
                                    className="fill-[var(--cx-background-gradient-2-dark)]"
                                />
                            </svg>
                        </div>
                    )}

                    <div className='relative '>
                        {isConnected && (
                            <div className="absolute -right-4 top-0 bottom-0 w-4 bg-[var(--cx-background-gradient-2-dark)]" />
                        )}
                        <div className={`flex items-center justify-between gap-8 px-2 w-full h-18`}>
                            {metrics?.submitted !== undefined && (
                            <div className="flex flex-col items-center flex-1">
                                <ValueLabel className="text-content-light block font-semibold text-5 uppercase">
                                {t('submitted')}
                                </ValueLabel>
                                <span className="text-1 font-bold leading-tight">
                                {metrics.submitted.toLocaleString()}
                                </span>
                                <div className="inline-flex justify-center items-center mt-1">
                                <MetricBarSvg type="submitted" />
                                </div>
                            </div>
                            )}

                            {metrics?.approved !== undefined && metrics?.submitted !== undefined && (
                            <div className="flex flex-col items-center flex-1">
                                <ValueLabel className="text-primary block font-semibold text-5 uppercase">
                                {t('approved')}
                                </ValueLabel>
                                <span className="text-1 font-bold m-0 leading-tight">
                                {metrics.approved.toLocaleString()}
                                </span>
                                <div className="inline-flex justify-center items-center gap-1 mt-0">
                                <MetricBarSvg type="approved" />
                                <span className="text-success text-[9px] font-medium leading-4">
                                    {((metrics.approved / metrics.submitted) * 100).toFixed(1)}%
                                </span>
                                </div>
                            </div>
                            )}

                            {metrics?.completed !== undefined && metrics?.submitted !== undefined && (
                            <div className="flex flex-col items-center flex-1">
                                <ValueLabel className="text-success block font-semibold text-5 uppercase">
                                {t('completed')}
                                </ValueLabel>
                                <span className="text-1 font-bold leading-tight">
                                {metrics.completed.toLocaleString()}
                                </span>
                                <div className="inline-flex justify-center items-center mt-1">
                                <div className="w-12 scale-y-[0.5]">
                                    <PercentageProgressBar
                                    value={metrics.completed}
                                    total={metrics.submitted}
                                    primaryBackgroundColor="bg-gray-300"
                                    secondaryBackgroudColor="bg-success"
                                    />
                                </div>
                                </div>
                            </div>
                            )}

                            {metrics?.distributedADA !== undefined && (
                            <div className="flex flex-col items-center flex-1">
                                <ValueLabel className="text-content-light font-semibold block text-5 text-nowrap uppercase">
                                    ₳ {t('distributed')}
                                </ValueLabel>
                                <span className="text-1 font-bold mt-2 leading-tight">
                                    ₳{shortNumber(metrics.distributedADA, 2)}
                                </span>
                                <div className="inline-flex justify-center items-center mt-1 h-4">
                                    {metrics?.distributedUSD !== undefined && (
                                        <span className="text-content-light text-[9px] font-medium">
                                            ${shortNumber(metrics.distributedUSD, 2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        {metrics?.awardedADA !== undefined && (
                            <div className="flex flex-col items-center flex-1">
                                <ValueLabel className="text-content-light block font-semibold text-5 text-nowrap uppercase">
                                    ₳ {t('awarded')}
                                </ValueLabel>
                                <span className="text-1 font-bold mt-2 leading-tight">
                                    ₳{shortNumber(metrics.awardedADA, 2)}
                                </span>
                                <div className="inline-flex justify-center items-center mt-1 h-4">
                                    {metrics?.awardedUSD !== undefined && (
                                        <span className="text-content-light text-[9px] font-medium">
                                            ${shortNumber(metrics.awardedUSD, 2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        {metrics?.requestedADA !== undefined && (
                            <div className="flex flex-col items-center flex-1">
                                <ValueLabel className="text-content-light font-semibold block text-5 text-nowrap uppercase">
                                    ₳ {t('requested')}
                                </ValueLabel>
                                <span className="text-1 font-bold mt-2 leading-tight">
                                    ₳{shortNumber(metrics.requestedADA, 2)}
                                </span>
                                <div className="inline-flex justify-center items-center mt-1 h-4">
                                    {metrics?.requestedUSD !== undefined && (
                                        <span className="text-content-light text-[9px] font-medium">
                                            ${shortNumber(metrics.requestedUSD, 2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                            <div className="flex items-center pl-3 ml-3">
                                <ViewAnalyticsButton
                                onClick={toggleAnalytics}
                                label={showAnalytics ? "Hide Analytics" : "View Analytics"}
                                showText={true}
                                isExpanded={showAnalytics}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default MetricsBar;
