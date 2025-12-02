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

interface MetricsBarProps extends ProposalMetrics {
    isConnected?: boolean;
    isAnimating?: boolean;
}

const MetricsBar: React.FC<MetricsBarProps> = ({ isConnected = false, isAnimating = false }) => {
    const { isPlayerBarExpanded } = useUIContext();
    const [isExpanded, setIsExpanded] = useState(true);
    const { metrics } = useMetrics();
    const onProposals = usePage().component == 'Proposals/Index';
    const { t } = useLaravelReactI18n();

    const borderRadiusClass = isConnected
        ? 'rounded-l-xl rounded-r-none'
        : 'rounded-xl';

    const gradientClass = isConnected
        ? 'bg-gradient-to-br from-[var(--cx-background-gradient-2-dark)] to-[var(--cx-background-gradient-2-dark)] bg-opacity-90'
        : 'bg-gradient-to-br from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]';

    return (
        metrics &&
        onProposals && (
            <div
                className={`${gradientClass} overflow-hidden ${borderRadiusClass} text-white shadow-lg transition-all duration-300 w-full ${
                    isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                }`}
                data-testid="metrics-bar-container"
            >
                <div className="lg:hidden w-full">
                    <div className="flex flex-col items-center px-4 py-4 w-full">
                        <div className="w-full max-w-md">
                            <div className="flex justify-center mb-4 gap-12">
                                {metrics?.submitted !== undefined && (
                                    <div className="flex flex-col items-center justify-start gap-1 w-28">
                                        <ValueLabel className="text-content-light block font-semibold text-[15px] uppercase tracking-wide">
                                            {t('submitted')}
                                        </ValueLabel>
                                        <span className="text-xl font-bold leading-5">
                                            {metrics.submitted.toLocaleString()}
                                        </span>
                                        <MetricBarSvg type="submitted" className="mt-2" />
                                    </div>
                                )}

                                {metrics?.approved !== undefined && metrics?.submitted !== undefined && (
                                    <div className="flex flex-col items-center justify-start gap-1 w-28">
                                        <ValueLabel className="text-primary block font-semibold text-[15px] uppercase tracking-wide">
                                            {t('approved')}
                                        </ValueLabel>
                                        <span className="text-xl font-bold leading-5">
                                            {metrics.approved.toLocaleString()}
                                        </span>
                                        <div className="inline-flex justify-center items-center gap-1 mt-1">
                                           <MetricBarSvg type="approved" />
                                            <div className="text-center justify-start text-green-500 text-[15px] font-medium font-['Inter'] leading-4">
                                                {((metrics.approved / metrics.submitted) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center mb-4 gap-24">
                                {metrics?.completed !== undefined && metrics?.submitted !== undefined && (
                                    <div className="flex flex-col items-center justify-start gap-1 w-28">
                                        <ValueLabel className="text-success block font-semibold text-[15px] uppercase tracking-wide">
                                            {t('completed')}
                                        </ValueLabel>
                                        <span className="text-xl font-bold leading-5">
                                            {metrics.completed.toLocaleString()}
                                        </span>
                                        <div className="inline-flex justify-center items-center gap-[3px] mt-1">
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
                                    <div className="flex flex-col items-center justify-start gap-1 w-28">
                                        <ValueLabel className="block text-content-light font-semibold text-[15px] text-nowrap uppercase tracking-wide">
                                            ₳ {t('distributed')}
                                        </ValueLabel>
                                        <span className="text-xl font-bold leading-5">
                                            ₳{shortNumber(metrics.distributedADA, 2)}
                                        </span>
                                        {metrics?.distributedUSD !== undefined && metrics.distributedUSD > 0 && (
                                            <div className="text-content-light text-[9px] font-medium">
                                                ${shortNumber(metrics.distributedUSD, 2)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center mb-4 gap-40">
                                {metrics?.awardedADA !== undefined && (
                                    <div className="flex flex-col items-center justify-start gap-1 w-28">
                                        <ValueLabel className="text-content-light block font-semibold text-[15px] text-nowrap uppercase tracking-wide">
                                            ₳ {t('awarded')}
                                        </ValueLabel>
                                        <span className="text-xl font-bold leading-5">
                                            ₳{shortNumber(metrics.awardedADA, 2)}
                                        </span>
                                        {metrics?.awardedUSD !== undefined && metrics.awardedUSD > 0 && (
                                            <div className="text-content-light text-[9px] font-medium">
                                                ${shortNumber(metrics.awardedUSD, 2)}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {metrics?.requestedADA !== undefined && (
                                    <div className="flex flex-col items-center justify-start gap-1 w-28">
                                        <ValueLabel className="text-content-light block font-semibold text-[15px] text-nowrap uppercase tracking-wide">
                                            ₳ {t('requested')}
                                        </ValueLabel>
                                        <span className="text-xl font-bold leading-5">
                                            ₳{shortNumber(metrics.requestedADA, 2)}
                                        </span>
                                        {metrics?.requestedUSD !== undefined && metrics.requestedUSD > 0 && (
                                            <div className="text-content-light text-[9px] font-medium">
                                                ${shortNumber(metrics.requestedUSD, 2)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center pb-4">
                        <ViewAnalyticsButton
                            onClick={() => {/* Add navigation logic */}}
                        />
                    </div>
                </div>
                <div className="hidden lg:flex lg:items-center lg:justify-between px-6 py-4 w-full min-h-16">
    {metrics?.submitted !== undefined && (
        <div className="flex flex-col items-center px-4 flex-1">
            <ValueLabel className="text-content-light block font-semibold text-xs uppercase">
                {t('submitted')}
            </ValueLabel>
            <span className="text-base font-bold mt-1">{metrics.submitted.toLocaleString()}</span>
            <div className="inline-flex justify-center items-center gap-1 mt-1 min-h-[20px]">
                <MetricBarSvg type="submitted" />
            </div>
        </div>
    )}
    {metrics?.approved !== undefined && metrics?.submitted !== undefined && (
        <div className="flex flex-col items-center px-4 flex-1">
            <ValueLabel className="text-primary block font-semibold text-xs uppercase">
                {t('approved')}
            </ValueLabel>
            <span className="text-base font-bold mt-1">{metrics.approved.toLocaleString()}</span>
            <div className="inline-flex justify-center items-center gap-1 min-h-[20px]">
                <MetricBarSvg type="approved" />
                <div className="text-center justify-start text-green-500 text-[12px] font-medium font-['Inter'] leading-4">
                    {((metrics.approved / metrics.submitted) * 100).toFixed(1)}%
                </div>
            </div>
        </div>
    )}
    {metrics?.completed !== undefined && metrics?.submitted !== undefined && (
        <div className="flex flex-col items-center px-4 flex-1">
            <ValueLabel className="text-success block font-semibold text-xs uppercase">
                {t('completed')}
            </ValueLabel>
            <span className="text-base font-bold">{metrics.completed.toLocaleString()}</span>
            <div className="inline-flex justify-center items-center gap-1 mt-1 min-h-[20px]">
                <div className="w-12 scale-y-[0.5]">
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
        <div className="flex flex-col items-center px-4 flex-1">
            <ValueLabel className="text-content-light font-semibold block text-xs text-nowrap uppercase">
                ₳ {t('distributed')}
            </ValueLabel>
            <span className="text-base font-bold mt-2">₳{shortNumber(metrics.distributedADA, 2)}</span>
            <div className="inline-flex justify-center items-center  min-h-[20px]">
                {metrics?.distributedUSD !== undefined && metrics.distributedUSD > 0 ? (
                    <div className="text-content-light text-[10px] font-medium">
                        ${shortNumber(metrics.distributedUSD, 2)}
                    </div>
                ) : (
                    <div className="h-[10px]" />
                )}
            </div>
        </div>
    )}
    {metrics?.awardedADA !== undefined && (
        <div className="flex flex-col items-center px-4 flex-1">
            <ValueLabel className=" text-content-light block  font-semibold text-xs text-nowrap uppercase">
                ₳ {t('awarded')}
            </ValueLabel>
            <span className="text-base font-bold mt-2">₳{shortNumber(metrics.awardedADA, 2)}</span>
            <div className="inline-flex justify-center items-center  min-h-[20px]">
                {metrics?.awardedUSD !== undefined && metrics.awardedUSD > 0 ? (
                    <div className="text-content-light text-[10px] font-medium">
                        ${shortNumber(metrics.awardedUSD, 2)}
                    </div>
                ) : (
                    <div className="h-[10px]" />
                )}
            </div>
        </div>
    )}
    {metrics?.requestedADA !== undefined && (
        <div className="flex flex-col items-center px-4 flex-1">
            <ValueLabel className="text-content-light font-semibold block text-xs text-nowrap uppercase">
                ₳ {t('requested')}
            </ValueLabel>
            <span className="text-base font-bold mt-2">₳{shortNumber(metrics.requestedADA, 2)}</span>
            <div className="inline-flex justify-center items-center  min-h-[20px]">
                {metrics?.requestedUSD !== undefined && metrics.requestedUSD > 0 ? (
                    <div className="text-content-light text-[10px] font-medium">
                        ${shortNumber(metrics.requestedUSD, 2)}
                    </div>
                ) : (
                    <div className="h-[10px]" />
                )}
            </div>
        </div>
    )}
    <div className="flex items-center pl-4 ml-4 ">
        <ViewAnalyticsButton
            onClick={() => {/* Add navigation logic */}}
        />
    </div>
</div>
            </div>
        )
    );
};

export default MetricsBar;
