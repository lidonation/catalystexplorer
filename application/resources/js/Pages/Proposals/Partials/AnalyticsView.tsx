import React, { useState } from 'react';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ProposalMetrics } from '@/types/proposal-metrics';
import { shortNumber } from '@/utils/shortNumber';
import PercentageProgressBar from '@/Components/PercentageProgressBar';
import ShareArrowIcon from '@/Components/svgs/ShareArrowIcon';
import { Link } from '@inertiajs/react';
import ShareIcon from '@/Components/svgs/ShareIcon';
import CloseIcon from '@/Components/svgs/CloseIcon';
import { ProposalStatusPieChart } from '@/Pages/Proposals/Partials/ProposalStatusPieChart';

interface AnalyticsViewProps {
    metrics: ProposalMetrics;
    isMobile?: boolean;
    onClose?: () => void;
}

interface AnalyticsCalculated {
    totalProposals: number;
    completedPercent: string;
    approvedPercent: string;
    fundedPercent: string;
    distributedPercent: string;
    awardedPercent: string;
}

function computeAnalytics(metrics: ProposalMetrics): AnalyticsCalculated & {
    completionRate: number;
    avgRequestedADA: number;
    avgRequestedUSD: number;
} {
    const totalProposals = metrics.submitted || 1;

    const completedPercent = metrics.completed
        ? ((metrics.completed / totalProposals) * 100).toFixed(1)
        : '0';

    const approvedPercent = metrics.approved
        ? ((metrics.approved / totalProposals) * 100).toFixed(1)
        : '0';

    const fundedPercent = metrics.funded && metrics.approved
        ? ((metrics.funded / metrics.approved) * 100).toFixed(1)
        : '0';

    const distributedPercent = metrics.distributedADA && metrics.awardedADA
        ? ((metrics.distributedADA / metrics.awardedADA) * 100).toFixed(1)
        : '0';

    const awardedPercent = metrics.awardedADA && metrics.requestedADA
        ? ((metrics.awardedADA / metrics.requestedADA) * 100).toFixed(1)
        : '0';

    const completionRate = metrics.approved && metrics.approved > 0
        ? ((metrics.completed ?? 0) / metrics.approved) * 100
        : 0;

    const avgRequestedADA = metrics.submitted && metrics.submitted > 0 && metrics.requestedADA
        ? metrics.requestedADA / metrics.submitted
        : 0;

    const avgRequestedUSD = metrics.submitted && metrics.submitted > 0 && metrics.requestedUSD
        ? metrics.requestedUSD / metrics.submitted
        : 0;

    return {
        totalProposals,
        completedPercent,
        approvedPercent,
        fundedPercent,
        distributedPercent,
        awardedPercent,
        completionRate,
        avgRequestedADA,
        avgRequestedUSD
    };
}

function exportMetricsToCSV(metrics: ProposalMetrics, t: (key: string) => string) {
    const computed = computeAnalytics(metrics);
    
    const rows = [
        ['Metric', 'Value'],
        [t('Submitted'), metrics.submitted?.toLocaleString() ?? '0'],
        [t('Approved'), metrics.approved?.toLocaleString() ?? '0'],
        [t('Funded'), metrics.funded?.toLocaleString() ?? '0'],
        [t('Completed'), metrics.completed?.toLocaleString() ?? '0'],
        [t('In Progress'), metrics.inProgress?.toLocaleString() ?? '0'],
        [t('Unfunded'), metrics.unfunded?.toLocaleString() ?? '0'],
        [t('Approval Rate') + ' (%)', computed.approvedPercent],
        [t('Completion Rate') + ' (%)', computed.completionRate.toFixed(1)],
        [''],
        [t('Funding Overview'), ''],
        [t('Requested') + ' (ADA)', metrics.requestedADA?.toLocaleString() ?? '0'],
        [t('Requested') + ' (USD)', metrics.requestedUSD?.toLocaleString() ?? '0'],
        [t('Awarded') + ' (ADA)', metrics.awardedADA?.toLocaleString() ?? '0'],
        [t('Awarded') + ' (USD)', metrics.awardedUSD?.toLocaleString() ?? '0'],
        [t('Distributed') + ' (ADA)', metrics.distributedADA?.toLocaleString() ?? '0'],
        [t('Distributed') + ' (USD)', metrics.distributedUSD?.toLocaleString() ?? '0'],
        [t('Awarded vs Requested') + ' (%)', computed.awardedPercent],
        [t('Distributed vs Awarded') + ' (%)', computed.distributedPercent],
        [t('Funded vs Approved') + ' (%)', computed.fundedPercent],
        [''],
        [t('KPIs'), ''],
        [t('Avg. Amount Requested') + ' (ADA)', computed.avgRequestedADA.toLocaleString()],
        [t('Groups'), metrics.groupsCount?.toLocaleString() ?? '0'],
        [t('Communities'), metrics.communitiesCount?.toLocaleString() ?? '0'],
    ];

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `proposal-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

type AnalyticsHeaderProps = {
    metrics: ProposalMetrics;
    onClose?: () => void;
};

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ metrics, onClose }) => {
    const { t } = useLaravelReactI18n();
    const chartsUrl = useLocalizedRoute('charts.proposals');
    return (
        <div className="w-full inline-flex justify-between items-center mb-4 px-4 py-2">
            <div className="flex justify-center items-center gap-2">
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                >
                    <path
                        d="M5.25 11.0833V7.58333C5.25 7.27391 5.12708 6.97717 4.90829 6.75838C4.6895 6.53958 4.39275 6.41667 4.08333 6.41667H2.91667C2.60725 6.41667 2.3105 6.53958 2.09171 6.75838C1.87292 6.97717 1.75 7.27391 1.75 7.58333V11.0833C1.75 11.3928 1.87292 11.6895 2.09171 11.9083C2.3105 12.1271 2.60725 12.25 2.91667 12.25H4.08333C4.39275 12.25 4.6895 12.1271 4.90829 11.9083C5.12708 11.6895 5.25 11.3928 5.25 11.0833ZM5.25 11.0833V5.25C5.25 4.94058 5.37292 4.64383 5.59171 4.42504C5.8105 4.20625 6.10725 4.08333 6.41667 4.08333H7.58333C7.89275 4.08333 8.1895 4.20625 8.40829 4.42504C8.62708 4.64383 8.75 4.94058 8.75 5.25V11.0833M5.25 11.0833C5.25 11.3928 5.37292 11.6895 5.59171 11.9083C5.8105 12.1271 6.10725 12.25 6.41667 12.25H7.58333C7.89275 12.25 8.1895 12.1271 8.40829 11.9083C8.62708 11.6895 8.75 11.3928 8.75 11.0833M8.75 11.0833V2.91667C8.75 2.60725 8.87292 2.3105 9.09171 2.09171C9.3105 1.87292 9.60725 1.75 9.91667 1.75H11.0833C11.3928 1.75 11.6895 1.87292 11.9083 2.09171C12.1271 2.3105 12.25 2.60725 12.25 2.91667V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H9.91667C9.60725 12.25 9.3105 12.1271 9.09171 11.9083C8.87292 11.6895 8.75 11.3928 8.75 11.0833Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <div className="text-content-light text-base font-bold leading-5">
                    {t('Proposal Analytics Dashboard')}
                </div>
                <div className="flex justify-start items-center gap-1">
                    <Link
                    href={chartsUrl}
                    className="flex items-center gap-1 text-primary text-xs font-normal leading-5 hover:underline"
                >
                    {t('View Charts')}
                    <ShareArrowIcon
                        width={13}
                        height={14}
                        className="text-primary"
                    />
                </Link>

                </div>
            </div>
            <div className="flex justify-center items-center gap-1">
                <div className="flex justify-end items-center gap-2.5">
                    <button
                        onClick={() => exportMetricsToCSV(metrics, t)}
                        className="px-2.5 py-2 bg-[var(--cx-background-gradient-1-dark)] rounded-md flex justify-start items-center gap-2.5 cursor-pointer transition-colors"
                    >
                        <span className="text-content-light/80 text-xs font-normal leading-3">
                            {t('Export CSV')}
                        </span>
                    </button>
                </div>
                <div className="flex justify-end items-center gap-2.5">
                    <div className="px-2.5 py-2 bg-[var(--cx-background-gradient-1-dark)] rounded-md flex justify-start items-center gap-1">
                        <div className="text-content-light text-xs font-normal leading-3">
                            {t('Share')}
                        </div>
                        <ShareIcon
                            width={11}
                            height={11}
                            className="text-content-light ml-0.5"
                        />
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md transition-colors cursor-pointer"
                        aria-label="Close analytics"
                    >
                        <CloseIcon
                            width={16}
                            height={16}
                            className="text-content-light"
                        />
                    </button>
                )}
            </div>
        </div>
    );
};

type StatusDistributionCardProps = {
    metrics: ProposalMetrics;
    isMobile?: boolean;
};

const StatusDistributionCard: React.FC<StatusDistributionCardProps> = ({
  metrics,
  isMobile = false,
}) => {
  const { t } = useLaravelReactI18n();

  const completed = metrics.completed || 0;
  const inProgress = metrics.inProgress || 0;
  const unfunded = metrics.unfunded || 0;
  const total = metrics.submitted || (completed + inProgress + unfunded);

  const legendItems = [
    { id: 'completed', label: t('Completed'), value: completed, colorClass: 'bg-success' },
    { id: 'in_progress', label: t('project.status.inProgress'), value: inProgress, colorClass: 'bg-primary' },
    { id: 'unfunded', label: t('project.status.unfunded'), value: unfunded, colorClass: 'bg-[var(--cx-dark)]' },
  ];

  if (isMobile) {
    return (
        <div className="w-full flex flex-col gap-3 ">
            <div className="text-content-light text-base font-semibold leading-7">
                {t('Proposal Status Distribution')}
            </div>


            <div className="flex w-full gap-10">
                <div className="basis-1/2 flex items-center justify-center">
                    <ProposalStatusPieChart
                    completed={completed}
                    inProgress={inProgress}
                    unfunded={unfunded}
                    total={total}
                    />
                </div>
                <div className="basis-1/2 space-y-3 items-end justify-end">
                    {legendItems.map((item) => {
                        const percent =
                            total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';

                        return (
                            <div key={item.id} className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${item.colorClass}`} />
                                    <span className="text-content-light text-4">
                                    {item.label}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-content-light text-4 font-semibold">
                                    {item.value.toLocaleString()}
                                    </span>
                                    <span className="text-content-light text-4 opacity-80 ml-1">
                                    ({percent}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
  }

  return (
  <div className="flex-1 w-full rounded-xl bg-[var(--cx-background-gradient-1-dark)]  dark:bg-[var(--cx-background-gradient-2-dark)] lg:p-3 flex flex-col gap-5">
    <div className="text-content-light text-lg lg:text-xl font-semibold leading-7">
      {t('Proposal Status Distribution')}
    </div>
    <div className="flex flex-col items-center gap-6">
      <div className="w-54 h-40 xl:w-62 xl:h-42">
        <ProposalStatusPieChart
          completed={completed}
          inProgress={inProgress}
          unfunded={unfunded}
          total={total}
        />
      </div>

      <div className="w-full max-w-md space-y-4">
        {legendItems.map((item) => {
          const percent =
            total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${item.colorClass}`} />
                <span className="text-white text-4">
                  {item.label}
                </span>
              </div>
              <span className="text-white text-4 font-semibold whitespace-nowrap">
                {item.value.toLocaleString()} ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
};

type FundingOverviewCardProps = {
    metrics: ProposalMetrics;
    distributedPercent: string;
    awardedPercent: string;
    fundedPercent: string;
    approvedPercent: string;
    isMobile?: boolean;
};

type CurrencyType = 'ADA' | 'USD' | 'USDM';

const FundingOverviewCard: React.FC<FundingOverviewCardProps> = ({
    metrics,
    distributedPercent,
    awardedPercent,
    fundedPercent,
    approvedPercent,
    isMobile = false
}) => {
    const { t } = useLaravelReactI18n();
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('ADA');

    const wrapperClasses = isMobile
        ? 'self-stretch flex flex-col justify-start items-start gap-2.5'
        : 'flex-1 p-2.5 bg-[var(--cx-background-gradient-1-dark)]  dark:bg-[var(--cx-background-gradient-2-dark)] rounded-xl inline-flex flex-col justify-start items-start gap-4';

    const getCurrencyValues = () => {
        if (selectedCurrency === 'USD') {
            return {
                distributed: metrics.distributedUSD || 0,
                awarded: metrics.awardedUSD || 0,
                requested: metrics.requestedUSD || 0,
                symbol: '$',
                suffix: '',
            };
        }
        return {
            distributed: metrics.distributedADA || 0,
            awarded: metrics.awardedADA || 0,
            requested: metrics.requestedADA || 0,
            symbol: '',
            suffix: ' ₳',
        };
    };

    const { distributed, awarded, requested, symbol, suffix } = getCurrencyValues();

    const currencyDistributedPercent = awarded > 0 
        ? ((distributed / awarded) * 100).toFixed(1) 
        : '0';
    const currencyAwardedPercent = requested > 0 
        ? ((awarded / requested) * 100).toFixed(1) 
        : '0';

    const currencyOptions: { value: CurrencyType; label: string; disabled?: boolean }[] = [
        { value: 'ADA', label: 'ADA(₳)' },
        { value: 'USD', label: 'Dollars($)' },
        { value: 'USDM', label: 'USDM', disabled: true },
    ];

    return (
        <div className={wrapperClasses}>
            <div className="w-full flex flex-col gap-2">
                <div className='text-content-light text-lg lg:text-xl font-semibold leading-7'>{t('Funding Overview')}</div>
                <div className="flex items-center gap-6">
                    {currencyOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => !option.disabled && setSelectedCurrency(option.value)}
                            disabled={option.disabled}
                            className={`flex items-center gap-1.5 text-5 transition-colors ${
                                option.disabled 
                                    ? 'text-content-light/60 cursor-not-allowed' 
                                    : selectedCurrency === option.value
                                        ? 'text-primary'
                                        : 'text-content-light '
                            }`}
                        >
                            <span className={`w-3.5 h-3.5 rounded-full border-1 flex items-center justify-center ${
                                option.disabled
                                    ? 'border-content-light/30'
                                    : selectedCurrency === option.value
                                        ? 'border-primary'
                                        : 'border-primary'
                            }`}>
                                {selectedCurrency === option.value && !option.disabled && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </span>
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            {/* Distributed vs Awarded */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch inline-flex justify-between items-start">
                    <div className={`text-4 font-normal leading-5`}>
                        {t('Distributed vs Awarded')}
                    </div>
                    <div className="flex justify-start items-center gap-1">
                        <div className={`text-4 font-semibold leading-5`}>
                            {symbol}{shortNumber(distributed, 2)}{suffix} / {symbol}{shortNumber(awarded, 2)}{suffix}
                        </div>
                    </div>
                </div>
                <div className='self-stretch'>
                    <PercentageProgressBar
                        value={distributed}
                        total={awarded}
                        primaryBackgroundColor="bg-gray-100/80"
                        secondaryBackgroudColor='bg-primary'
                    />
                </div>
                <div className="self-stretch flex justify-end">
                    <div className={`text-5 text-content-light/80 font-normal leading-5`}>
                        {currencyDistributedPercent}% {t('distributed')}
                    </div>
                </div>
            </div>

            {/* Awarded vs Requested */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch inline-flex justify-between items-start">
                    <div className={`text-4 font-normal leading-5`}>
                        {t('Awarded vs Requested')}
                    </div>
                    <div className="flex justify-start items-center gap-1">
                        <div className={`text-4 font-semibold leading-5`}>
                            {symbol}{shortNumber(awarded, 2)}{suffix} / {symbol}{shortNumber(requested, 2)}{suffix}
                        </div>
                    </div>
                </div>
                <div className='self-stretch'>
                    <PercentageProgressBar
                        value={awarded}
                        total={requested}
                        primaryBackgroundColor="bg-gray-100/80"
                        secondaryBackgroudColor='bg-primary'
                    />
                </div>
                <div className="self-stretch flex justify-end">
                    <div className={`text-5 text-content-light/80 font-normal leading-5`}>
                        {currencyAwardedPercent}% {t('awarded')}
                    </div>
                </div>
            </div>

            {/* Funded vs Approved */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch inline-flex justify-between items-start">
                    <div className={`text-4 font-normal leading-5`}>
                        {t('Funded vs Approved')}
                    </div>
                    <div className="flex justify-start items-center gap-1">
                        <div className={`text-4 font-semibold leading-5`}>
                            {(metrics.funded || 0).toLocaleString()} / {(metrics.approved || 0).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className='self-stretch'>
                    <PercentageProgressBar
                        value={metrics.funded || 0}
                        total={metrics.approved || 0}
                        primaryBackgroundColor="bg-gray-100/80"
                        secondaryBackgroudColor='bg-primary'
                    />
                </div>
                <div className="self-stretch flex justify-end">
                    <div className={`text-5 text-content-light/80 font-normal leading-5`}>
                        {fundedPercent}% {t('funded')}
                    </div>
                </div>
            </div>
            {!isMobile && (
                <div className="self-stretch flex flex-col justify-center items-center mt-4 border-t">
                    <div className="text-content-light/80 text-[8px] font-normal mt-2 leading-5">
                        {t('Success Rate')}
                    </div>
                    <div className="text-content-light text-1 font-bold leading-5">
                        {approvedPercent}%
                    </div>
                    <div className="text-center text-success text-5 font-medium leading-5">
                        {t('Approval Rate')}
                    </div>
                </div>
            )}

            {isMobile && (
                <div className="self-stretch flex flex-col justify-center items-center mt-2">
                    <div className="text-content-light/80 text-[8px] font-normal leading-5">
                        {t('Success Rate')}
                    </div>
                    <div className="text-content-light text-1 font-bold leading-5">
                        {approvedPercent}%
                    </div>
                    <div className="text-center text-success text-5 font-medium leading-5">
                        {t('Approval Rate')}
                    </div>
                </div>
            )}
        </div>
    );
};

type KpisCardProps = {
    metrics: ProposalMetrics;
    completionRate: number;
    avgRequestedADA: number;
    avgRequestedUSD: number;
    isMobile?: boolean;
};

const KpisCard: React.FC<KpisCardProps> = ({ metrics, completionRate, avgRequestedADA, avgRequestedUSD, isMobile = false }) => {
    const { t } = useLaravelReactI18n();
    const groupsUrl = useLocalizedRoute('groups.index');
    const communitiesUrl = useLocalizedRoute('communities.index');

    const wrapperClasses = isMobile
        ? 'self-stretch inline-flex flex-col justify-start items-center gap-2.5'
        : 'flex-1 p-2.5 bg-[var(--cx-background-gradient-1-dark)]  dark:bg-[var(--cx-background-gradient-2-dark)]  rounded-xl inline-flex flex-col justify-start items-start gap-4';

    const hasADA = avgRequestedADA > 0;
    const hasUSD = avgRequestedUSD > 0;

    return (
        <div className={wrapperClasses}>
            <div className="inline-flex justify-start items-start gap-2  w-full">
                <div className='text-content-light text-lg lg:text-xl font-semibold leading-7'>{t('KPIs')}</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-3 ">
                {/* AVG. AMOUNT REQUESTED */}
                <div className="self-stretch flex flex-col justify-center items-start">
                    <div
                        className={` text-5 text-content-light/80 font-normal leading-5 whitespace-nowrap`}
                    >
                        {t('AVG. AMOUNT REQUESTED')}
                    </div>
                    <div className="flex flex-col gap-2">
                        {hasADA && (
                            <div className={`text-1 font-bold leading-5`}>
                                {shortNumber(avgRequestedADA, 2)} ₳
                            </div>
                        )}
                        {hasUSD && (
                            <div className={`${hasADA ? 'text-1 ' : 'text-1'} font-bold leading-5`}>
                                ${shortNumber(avgRequestedUSD, 2)}
                            </div>
                        )}
                        {!hasADA && !hasUSD && (
                            <div className={`text-1 font-bold leading-5`}>0</div>
                        )}
                    </div>
                    <div className={` text-5 text-content-light/80 font-normal leading-5`}>
                        {t('Per submitted proposal')}
                    </div>
                </div>

                {/* COMPLETION RATE */}
                <div className="self-stretch flex flex-col justify-center items-start ">
                    <div
                        className={` text-5 text-content-light/80 font-normal leading-5`}
                    >
                        {t('COMPLETION RATE')}
                    </div>
                    <div className={` text-1 font-bold leading-5`}>
                        {completionRate.toFixed(1)}%
                    </div>
                    <div
                        className={` text-5 text-content-light/80 font-normal leading-5`}
                    >
                        {t('Of approved proposals')}
                    </div>
                </div>
                <div className="self-stretch flex flex-col justify-center items-start">
                    <div
                        className={` text-5 text-content-light/80 font-normal leading-5`}
                    >
                        {t('GROUPS')}
                    </div>
                    <Link href={groupsUrl} className={`text-1 font-bold leading-5 hover:text-primary transition-colors`}>
                        {(metrics.groupsCount || 0).toLocaleString()}
                    </Link>
                    <div
                        className={` text-5 text-content-light/80 font-normal leading-5`}
                    >
                        {t('Teams supported')}
                    </div>
                </div>

                {/* COMMUNITIES */}
                <div className="self-stretch flex flex-col justify-center items-start">
                    <div
                        className={` text-5 text-content-light/80 font-normal leading-5`}
                    >
                        {t('COMMUNITIES')}
                    </div>
                    <Link href={communitiesUrl} className={`text-1 font-bold leading-5 hover:text-primary transition-colors`}>
                        {(metrics.communitiesCount || 0).toLocaleString()}
                    </Link>
                </div>
            </div>
        </div>
    );
};

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ metrics, isMobile = false, onClose }) => {
    const { approvedPercent, fundedPercent, distributedPercent, awardedPercent, completionRate, avgRequestedADA, avgRequestedUSD } =
        computeAnalytics(metrics);

    if (isMobile) {
        return (
            <div className="space-y-6 px-4 py-4">
                <StatusDistributionCard metrics={metrics} isMobile />

                <FundingOverviewCard
                    metrics={metrics}
                    distributedPercent={distributedPercent}
                    awardedPercent={awardedPercent}
                    fundedPercent={fundedPercent}
                    approvedPercent={approvedPercent}
                    isMobile
                />

                <KpisCard metrics={metrics} completionRate={completionRate} avgRequestedADA={avgRequestedADA} avgRequestedUSD={avgRequestedUSD} isMobile />
            </div>
        );
    }

    return (
        <>
            <AnalyticsHeader metrics={metrics} onClose={onClose} />
            <div className="w-full inline-flex justify-start items-stretch gap-2.5 px-6 py-4">
                <StatusDistributionCard metrics={metrics} />
                <FundingOverviewCard
                    metrics={metrics}
                    distributedPercent={distributedPercent}
                    awardedPercent={awardedPercent}
                    fundedPercent={fundedPercent}
                    approvedPercent={approvedPercent}
                />
                <KpisCard metrics={metrics} completionRate={completionRate} avgRequestedADA={avgRequestedADA} avgRequestedUSD={avgRequestedUSD} />
            </div>
        </>
    );
};

export default AnalyticsView;
