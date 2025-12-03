// ProposalStatusPieChart.tsx
import PieChart from '@/Pages/Charts/Partials/PieChart';
import React from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { shortNumber } from '@/utils/shortNumber';

interface ProposalStatusPieChartProps {
    completed: number;
    inProgress: number;
    unfunded: number;
    className?: string;
}

const ProposalStatusPieChart: React.FC<ProposalStatusPieChartProps> = ({
    completed,
    inProgress,
    unfunded,
    className = '',
}) => {
    const { t } = useLaravelReactI18n();
    const total = completed + inProgress + unfunded;
    const completedPercent = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
    const inProgressPercent = total > 0 ? ((inProgress / total) * 100).toFixed(1) : '0';
    const unfundedPercent = total > 0 ? ((unfunded / total) * 100).toFixed(1) : '0';

    const statusItems = [
        {
            id: 'complete',
            label: t('project.status.complete'),
            value: completed,
            percentage: completedPercent,
            color: 'bg-success', 
            chartId: 'Completed Proposals',
        },
        {
            id: 'in_progress',
            label: t('project.status.inProgress'),
            value: inProgress,
            percentage: inProgressPercent,
            color: 'bg-primary',
            chartId: 'In Progress Proposals',
        },
        {
            id: 'unfunded',
            label: t('project.status.unfunded'),
            value: unfunded,
            percentage: unfundedPercent,
            color: 'bg-accent-secondary',
            chartId: 'Unfunded Proposals',
        },
    ];
    
    const pieChartData = statusItems.map(item => ({
        id: item.chartId,
        data: [{ x: 0, y: item.value }]
    }));

    return (
        <div className={`${className}`}>
            <div className="flex flex-row items-start gap-6 lg:hidden">
                {/* <div className="flex-shrink-0"> */}
                    <div className="w-20 h-10">
                        <div className="[&_.mb-4:first-child]:hidden [&_.grid]:hidden [&_.mt-4]:hidden">
                            <PieChart 
                                chartData={pieChartData}
                                selectedOptionIndex={0}
                                viewBy="fund"
                            />
                        </div>
                    </div>
                {/* </div> */}
                
                <div className="flex-1">
                    <div className="flex flex-col justify-start items-start gap-2">
                        {statusItems.map((item) => (
                            <div 
                                key={item.id}
                                className="self-stretch inline-flex justify-between items-start w-full"
                            >
                                <div className="flex justify-start items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                    <div className="justify-start text-content-light text-xs font-normal leading-5">
                                        {item.label}
                                    </div>
                                </div>
                                <div className="justify-start text-content-light text-xs font-semibold leading-5">
                                    {shortNumber(item.value, 0)} ({item.percentage}%)
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex lg:flex-col">
                <div className="w-48 h-48 mx-auto">
                    <div className="[&_.mb-4:first-child]:hidden [&_.grid]:hidden [&_.mt-4]:hidden">
                        <PieChart 
                            chartData={pieChartData}
                            selectedOptionIndex={0}
                            viewBy="fund"
                        />
                    </div>
                </div>
                <div className="w-full mt-6">
                    <div className="flex flex-col justify-start items-start gap-2">
                        {statusItems.map((item) => (
                            <div 
                                key={item.id}
                                className="self-stretch inline-flex justify-between items-start w-full"
                            >
                                <div className="flex justify-start items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                    <div className="justify-start text-content-light text-xs font-normal leading-5">
                                        {item.label}
                                    </div>
                                </div>
                                <div className="justify-start text-content-light text-xs font-semibold leading-5">
                                    {shortNumber(item.value, 0)} ({item.percentage}%)
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalStatusPieChart;