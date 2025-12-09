import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

interface SetChartMetricsProps {
    onExploreCharts: () => void;
    onChartDataReceived?: (chartData: any) => void;
    onLoadingChange?: (loading: boolean) => void;
    disableAutoComplete?: boolean;
}

export default function SetChartMetrics({
    onExploreCharts,
    onChartDataReceived,
    onLoadingChange,
    disableAutoComplete = false,
}: SetChartMetricsProps) {
    const { t } = useLaravelReactI18n();
    const [step1Complete, setStep1Complete] = useState(false);
    const [step2Complete, setStep2Complete] = useState(false);
    const [step3Complete, setStep3Complete] = useState(false);
    const [allMetricsSet, setAllMetricsSet] = useState(false);
    const [rules, setRules] = useState<string[]>([]);

    const handleStep1Completion = (isComplete: boolean): void => {
        setStep1Complete(isComplete);
    };

    const handleStep2Completion = (isChartSelected: boolean): void => {
        setStep2Complete(isChartSelected);
    };

    const handleStep3Completion = (isChartSelected: boolean): void => {
        setStep3Complete(isChartSelected);
    };

    const handleStep3Next = (): void => {
        if (step3Complete) {
            setAllMetricsSet(true);
        }
    };

    const handleChartDataReceived = (chartData: any): void => {
        onChartDataReceived?.(chartData);
    };

    const handleLoadingChange = (loading: boolean): void => {
        onLoadingChange?.(loading);
    };

    return (
        <div data-testid="set-chart-metrics">
            <div className="mb-4 text-center">
                <Title level="3">{t('charts.setMetrics')}</Title>
            </div>
            <Card className="p-6 bg-background">
                <div className="mb-6">
                    <Step1
                        onCompletionChange={handleStep1Completion}
                        onRulesChange={setRules}
                    />
                </div>

                <div
                    className={`${!step1Complete ? 'pointer-events-none opacity-50' : ''} mb-6`}
                >
                    <Step2 onCompletionChange={handleStep2Completion} />
                </div>

                <div
                    className={`${!step2Complete || !step1Complete ? 'pointer-events-none opacity-50' : ''}`}
                >
                    <Step3
                        onCompletionChange={handleStep3Completion}
                        onNext={handleStep3Next}
                        onExploreCharts={onExploreCharts}
                        rules={rules}
                        onChartDataReceived={handleChartDataReceived}
                        onLoadingChange={handleLoadingChange}
                        disableAutoComplete={disableAutoComplete}
                    />
                </div>
            </Card>
        </div>
    );
}
