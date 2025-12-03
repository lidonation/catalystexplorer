import React from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ProposalMetrics } from '@/types/proposal-metrics';
import Checkbox from '@/Components/atoms/Checkbox';
import { shortNumber } from '@/utils/shortNumber';
import PercentageProgressBar from '@/Components/PercentageProgressBar';
import ProposalStatusPieChart from '@/Pages/Proposals/Partials/ProposalStatusPieChart';

interface AnalyticsViewProps {
    metrics: ProposalMetrics;
    isMobile?: boolean;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ metrics, isMobile = false }) => {
    const { t } = useLaravelReactI18n();
    
    const totalProposals = metrics.submitted || 1;
    const completedPercent = metrics.completed ? (metrics.completed / totalProposals * 100).toFixed(1) : '0';
    const approvedPercent = metrics.approved ? (metrics.approved / totalProposals * 100).toFixed(1) : '0';
    
    const distributedPercent = metrics.distributedADA && metrics.awardedADA 
        ? ((metrics.distributedADA / metrics.awardedADA) * 100).toFixed(1)
        : '73.1';
    
    const awardedPercent = metrics.awardedADA && metrics.requestedADA
        ? ((metrics.awardedADA / metrics.requestedADA) * 100).toFixed(1)
        : '20.7';

    const pieChartData = [
        {
            id: 'Completed Proposals',
            data: [{ x: 0, y: metrics.completed || 0 }]
        },
        {
            id: 'In Progress Proposals',
            data: [{ x: 0, y: 2148 }] 
        },
        {
            id: 'Unfunded Proposals',
            data: [{ x: 0, y: 6123 }] 
        }
    ];

    
    if (isMobile) {
        return (
            <div className="space-y-6 px-4 py-4">
                <div className="self-stretch inline-flex flex-col justify-center items-center gap-4">
                    <div className="self-stretch inline-flex justify-start items-start gap-6">
                        <div className="justify-start text-white text-base font-semibold  leading-7">
                            {t('Proposal Status Distribution')}
                        </div>

                    </div>
                        <ProposalStatusPieChart
                            completed={metrics.completed || 0}
                            inProgress={2148} 
                            unfunded={6123} 
                            className="w-full"
                    />
                </div>
                <div className="self-stretch inline-flex flex-col justify-center items-start gap-2.5">
                    <div className="inline-flex justify-start items-start gap-6">
                        <div className="justify-start text-white text-base font-semibold  leading-7">
                            {t('Funding Overview')}
                        </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-1">
                        <div className="self-stretch inline-flex justify-between items-start">
                            <div className="justify-start text-white text-xs font-normal leading-5">
                                {t('Distributed')}
                            </div>
                            <div className="flex justify-start items-center gap-1">
                                <div className="justify-start text-white text-xs font-semibold leading-5">
                                    {shortNumber(metrics.distributedADA || 0, 2)} ₳
                                </div>
                                <div className="justify-start text-white/40 text-xs font-normal leading-5">
                                    {distributedPercent}% of awarded
                                </div>
                            </div>
                        </div>
                        <div className="w-80">
                            <PercentageProgressBar
                            value={metrics.distributedADA || 0}
                            total={metrics.awardedADA || 0}
                            primaryBackgroundColor="bg-gray-100/80"
                            secondaryBackgroudColor="bg-sky-400"
                        />
                        </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-1">
                        <div className="self-stretch inline-flex justify-between items-start">
                            <div className="justify-start text-white text-xs font-normal  leading-5">
                                {t('Awarded')}
                            </div>
                            <div className="flex justify-start items-center gap-1">
                                <div className="justify-start text-white text-xs font-semibold  leading-5">
                                    {shortNumber(metrics.awardedADA || 0, 2)} ₳
                                </div>
                                <div className="justify-start text-white/40 text-xs font-normal leading-5">
                                    {awardedPercent}% of requested
                                </div>
                            </div>
                        </div>
                        <div className="w-80">
                            <PercentageProgressBar
                                value={metrics.awardedADA || 0}
                                total={metrics.requestedADA || 0}
                                primaryBackgroundColor="bg-gray-100/80"
                                secondaryBackgroudColor="bg-sky-400"
                            />
                        </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-1">
                        <div className="self-stretch inline-flex justify-between items-start">
                            <div className="justify-start text-white text-xs font-normal  leading-5">
                                {t('Requested')}
                            </div>
                            <div className="w-48 flex justify-end items-center gap-1">
                                <div className="justify-start text-white text-xs font-semibold leading-5">
                                    {shortNumber(metrics.requestedADA || 0, 2)} ₳
                                </div>
                                <div className="justify-start text-white/40 text-xs font-normal leading-5">
                                    {t('Total demand')}
                                </div>
                            </div>
                        </div>
                        <div className="w-80">
                            <PercentageProgressBar
                                value={metrics.requestedADA || 0}
                                total={metrics.requestedADA || 1} 
                                primaryBackgroundColor="bg-gray-100/80"
                                secondaryBackgroudColor=" "
                            />
                        </div>
                        {/* Alternative: If you have a total budget cap, use that instead */}
                        {/* <PercentageProgressBar
                            value={metrics.requestedADA || 0}
                            total={totalBudget || 0}
                            primaryBackgroundColor="bg-gray-100/80"
                            secondaryBackgroudColor="bg-sky-400"
                        /> */}
                    </div>
                    
                    {/* Success Rate */}
                    <div className="self-stretch flex flex-col justify-center items-center">
                        <div className="justify-start text-content-light/40 text-xs font-normal  leading-5">
                            {t('Success Rate')}
                        </div>
                        <div className="justify-start text-white text-xl font-bold leading-5">
                            {approvedPercent}%
                        </div>
                        <div className="text-center justify-start text-success text-xs font-medium  leading-5">
                            {t('Approval Rate')}
                        </div>
                    </div>
                </div>

                {/* Section 3: KPIs */}
                <div className="self-stretch inline-flex flex-col justify-start items-center gap-2.5">
                    <div className="self-stretch inline-flex justify-start items-start gap-6">
                        <div className="justify-start text-white text-base font-semibold  leading-7">
                            {t('KPIs')}
                        </div>
                    </div>
                    <div className="inline-flex justify-start items-start gap-3.5">
                        {['Fund 14', 'Fund 13', 'Fund 12'].map((fund) => (
                            <div key={fund} className="flex justify-start items-center gap-1.5">
                                <Checkbox defaultChecked className="w-4 h-4" />
                                <div className="justify-start text-white text-xs font-small  leading-3">
                                    {fund}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
                        <div className="self-stretch inline-flex justify-start items-start gap-6">
                            <div className="flex-1 inline-flex flex-col justify-center items-start gap-1">
                                <div className="justify-start text-content-light/40 text-xs leading-5 whitespace-nowrap">
                                    {t('AVG. AMOUNT REQUESTED')}
                                </div>
                                <div className="justify-start text-white text-xl font-bold  leading-5">
                                    {shortNumber(88600, 2)} ₳
                                </div>
                                <div className="justify-start text-content-light/40 text-xs font-normal  leading-5">
                                    {t('Per approved proposal')}
                                </div>
                            </div>
                            <div className="flex-1 inline-flex flex-col justify-center items-start gap-1">
                                <div className="justify-start text-content-light/40 text-xs font-normal leading-5">
                                    {t('COMPLETION RATE')}
                                </div>
                                <div className="justify-start text-white text-xl font-bold  leading-5">
                                    61.8%
                                </div>
                                <div className="justify-start text-content-light/40 text-xs font-normal leading-5">
                                    {t('Of approved proposals')}
                                </div>
                            </div>
                        </div>
                        <div className="self-stretch flex flex-col justify-center items-start gap-1">
                            <div className="justify-start text-content-light/40 text-xs font-normal leading-5">
                                {t('ADA DISTRIBUTED')}
                            </div>
                            <div className="justify-start text-white text-xl font-bold  leading-5">
                                {shortNumber(metrics.distributedADA || 0, 2)} ₳
                            </div>
                            <div className="justify-start text-white/40 text-xs font-normal  leading-5">
                                {t('Total distributed amount')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // Desktop View (3 columns)
// Desktop View (3 columns)
return (
    <>
        <div className="w-full inline-flex justify-between items-center mb-4 px-2 py-2">
            <div className="flex justify-center items-center gap-2.5">
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
                <div className="justify-start text-content-light text-base font-bold leading-5">
                    {t('Proposal Analytics Dashboard')}
                </div>
                <div className="flex justify-start items-center gap-[5px]">
                    <div className="justify-start text-cyan-600 text-xs font-normal leading-5">
                        {t('View Charts')}
                    </div>
                    {/* <div className="w-3 h-3.5 relative overflow-hidden">
                        <div className="w-[3.25px] h-1 left-[8.13px] top-[1.75px] absolute outline outline-1 outline-offset-[-0.50px] outline-cyan-600" />
                        <div className="w-1.5 h-1.5 left-[5.42px] top-[1.75px] absolute outline outline-1 outline-offset-[-0.50px] outline-cyan-600" />
                        <div className="w-2 h-2 left-[1.63px] top-[3.50px] absolute outline outline-1 outline-offset-[-0.50px] outline-cyan-600" />
                    </div> */}
                </div>
            </div>
            <div className="flex justify-center items-center gap-1">
                <div className="flex justify-end items-center gap-2.5">
                    <div className="px-2.5 py-2 bg-[var(--cx-background-gradient-1-dark)] rounded-md flex justify-start items-center gap-2.5">
                        <div className="justify-start text-content-light/80 text-xs font-normal leading-3">
                            {t('Export CSV')}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end items-center gap-2.5">
                    <div className="px-2.5 py-2 bg-[var(--cx-background-gradient-1-dark)] rounded-md flex justify-start items-center gap-[5px]">
                        <div className="justify-start text-content-light text-xs font-normal leading-3">
                            {t('Share')}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Your EXISTING 3-column layout - NO CHANGES */}
        <div className="w-full inline-flex justify-start items-stretch gap-2.5 px-6 py-4">
            <div className="flex-1 p-2.5 bg-[var(--cx-background-gradient-1-dark)] rounded-xl  inline-flex flex-col justify-start items-start gap-3.5">
                <div className="inline-flex justify-start items-start gap-6">
                    <div className="justify-start text-content-light text-base font-semibold leading-7">
                        {t('Proposal Status Distribution')}
                    </div>
                </div>
                <div className="w-60 h-48 inline-flex justify-start items-center gap-6">
                    <div className="w-60 h-48 relative">
                        
                    </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch inline-flex justify-between items-start">
                        <div className="flex justify-start items-center gap-2">
                            <div className="w-2 h-2 bg-success rounded-full" />
                            <div className="justify-start text-content-light text-xs font-normal  leading-5">
                                {t('Completed')}
                            </div>
                        </div>
                        <div className="justify-start text-content-light text-xs font-semibold  leading-5">
                            {metrics.completed?.toLocaleString() || '0'} ({completedPercent}%)
                        </div>
                    </div>
                    <div className="self-stretch inline-flex justify-between items-start">
                        <div className="flex justify-start items-center gap-2">
                            <div className="w-2 h-2 bg-sky-400 rounded-full" />
                            <div className="justify-start text-content-light text-xs font-normal  leading-5">
                                {t('In Progress')}
                            </div>
                        </div>
                        <div className="justify-start text-content-light text-xs font-semibold leading-5">
                            2,148 (22.4%)
                        </div>
                    </div>
                    <div className="self-stretch inline-flex justify-between items-start">
                        <div className="flex justify-start items-center gap-2">
                            <div className="w-2 h-2 bg-white/20 rounded-full" />
                            <div className="justify-start text-content-light text-xs font-normal  leading-5">
                                {t('Unfunded')}
                            </div>
                        </div>
                        <div className="justify-start text-content-light text-xs font-semibold leading-5">
                            6,123 (63.8%)
                        </div>
                    </div>
                </div>
            </div>

            {/* Column 2: Funding Overview Card */}
            <div className="flex-1 p-2.5 bg-[var(--cx-background-gradient-1-dark)] rounded-xl inline-flex flex-col justify-start items-start gap-3.5">
                <div className="inline-flex justify-start items-start gap-6">
                    <div className="justify-start text-content-light text-base font-semibold leading-7">
                        {t('Funding Overview')}
                    </div>
                </div>
                
                {/* Distributed */}
                <div className="self-stretch flex flex-col justify-start items-start gap-[5px]">
                    <div className="self-stretch inline-flex justify-between items-start">
                        <div className="justify-start text-content-light text-xs font-normal leading-5">
                            {t('Distributed')}
                        </div>
                        <div className="justify-start text-content-light text-xs font-semibold leading-5">
                            {shortNumber(metrics.distributedADA || 0, 2)} ₳
                        </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start">
                        <div className="self-stretch">
                            <PercentageProgressBar
                                value={metrics.distributedADA || 0}
                                total={metrics.awardedADA || 0}
                                primaryBackgroundColor="bg-gray-100/80"
                                secondaryBackgroudColor="bg-sky-400"
                            />
                        </div>
                        <div className="self-stretch inline-flex justify-end items-start gap-4 mt-1">
                            <div className="justify-start text-content-light/40 text-xs font-normal leading-5">
                                {distributedPercent}% of awarded
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Awarded */}
                <div className="self-stretch flex flex-col justify-start items-start gap-[5px]">
                    <div className="self-stretch inline-flex justify-between items-start">
                        <div className="justify-start text-content-light text-xs font-normal leading-5">
                            {t('Awarded')}
                        </div>
                        <div className="justify-start text-content-light text-xs font-semibold leading-5">
                            {shortNumber(metrics.awardedADA || 0, 2)} ₳
                        </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start">
                        <div className="self-stretch">
                            <PercentageProgressBar
                                value={metrics.awardedADA || 0}
                                total={metrics.requestedADA || 0}
                                primaryBackgroundColor="bg-gray-100/80"
                                secondaryBackgroudColor="bg-sky-400"
                            />
                        </div>
                        <div className="self-stretch inline-flex justify-end items-start gap-4 mt-1">
                            <div className="justify-start text-content-light/40 text-xs font-normal leading-5">
                                {awardedPercent}% of requested
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Requested */}
                <div className="self-stretch flex flex-col justify-start items-start gap-[5px]">
                    <div className="self-stretch inline-flex justify-between items-start">
                        <div className="justify-start text-content-light text-xs font-normal leading-5">
                            {t('Requested')}
                        </div>
                        <div className="justify-start text-content-light text-xs font-semibold leading-5">
                            {shortNumber(metrics.requestedADA || 0, 2)} ₳
                        </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start">
                        <div className="self-stretch">
                            <PercentageProgressBar
                                value={metrics.requestedADA || 0}
                                total={metrics.requestedADA || 1}
                                primaryBackgroundColor="bg-gray-100/80"
                                secondaryBackgroudColor="bg-sky-400"
                            />
                        </div>
                        <div className="self-stretch inline-flex justify-end items-start gap-4 mt-1">
                            <div className="justify-start text-content-light/40 text-xs font-normal leading-5">
                                {t('Total demand')}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Success Rate */}
                <div className="self-stretch flex flex-col justify-center items-center mt-2 border-t ">
                    <div className="justify-start text-content-light/40 text-xs font-normal leading-5">
                        {t('Success Rate')}
                    </div>
                    <div className="justify-start text-content-light text-xl font-bold leading-5">
                        {approvedPercent}%
                    </div>
                    <div className="text-center justify-start text-green-500 text-xs font-medium leading-5">
                        {t('Approval Rate')}
                    </div>
                </div>
            </div>

            {/* Column 3: KPIs Card */}
            <div className="flex-1 p-2.5 bg-[var(--cx-background-gradient-1-dark)] rounded-xl  inline-flex flex-col justify-start items-start gap-3.5">
                <div className="inline-flex justify-start items-start gap-2">
                    <div className="justify-start text-content-light text-base font-semibold leading-7">
                        {t('KPIs')}
                    </div>
                </div>
                
                {/* Fund checkboxes */}
                <div className="inline-flex justify-start items-start gap-3">
                    {['Fund 14', 'Fund 13', 'Fund 12'].map((fund) => (
                        <div key={fund} className="flex justify-start items-center gap-0.5">
                            <Checkbox defaultChecked className="w-4 h-4" />
                            <div className="justify-start text-content-light text-xs font-normal leading-3">
                                {fund}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* KPI metrics */}
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    {/* AVG. AMOUNT REQUESTED */}
                    <div className="self-stretch flex flex-col justify-center items-start gap-1">
                        <div className="justify-start text-content-light/40 text-xs font-normal leading-5 whitespace-nowrap">
                            {t('AVG. AMOUNT REQUESTED')}
                        </div>
                        <div className="justify-start text-content-light text-xl font-bold leading-5">
                            {shortNumber(88600, 2)} ₳
                        </div>
                        <div className="justify-start text-content-light/40 text-s font-normal  leading-5">
                            {t('Per approved proposal')}
                        </div>
                    </div>
                    
                    {/* COMPLETION RATE */}
                    <div className="self-stretch flex flex-col justify-center items-start gap-2">
                        <div className="justify-start text-content-light/40 text-xs font-normal  leading-5">
                            {t('COMPLETION RATE')}
                        </div>
                        <div className="justify-start text-content-light text-xl font-bold  leading-5">
                            61.8%
                        </div>
                        <div className="justify-start text-content-light/40 text-xs font-normal leading-5">
                            {t('Of approved proposals')}
                        </div>
                    </div>
                    
                    {/* ADA DISTRIBUTED */}
                    <div className="self-stretch flex flex-col justify-center items-start gap-1">
                        <div className="justify-start text-content-light/40 text-xs font-normal  leading-5">
                            {t('ADA DISTRIBUTED')}
                        </div>
                        <div className="justify-start text-content-light text-xl font-bold leading-5">
                            {shortNumber(metrics.distributedADA || 0, 2)} ₳
                        </div>
                        <div className="justify-start text-content-light/40 text-xs font-normalleading-5">
                            {t('Total distributed amount')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default AnalyticsView;