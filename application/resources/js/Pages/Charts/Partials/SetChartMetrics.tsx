import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

interface SetChartMetricsProps {
    onMetricsSet?: (isSet: boolean) => void;
    onExploreCharts: () => void;
}

export default function SetChartMetrics({
    onMetricsSet,
    onExploreCharts,
}: SetChartMetricsProps) {
    const { t } = useTranslation();
    const [step1Complete, setStep1Complete] = useState(false);
    const [step2Enabled, setStep2Enabled] = useState(false);
    const [step2Complete, setStep2Complete] = useState(false);
    const [step3Enabled, setStep3Enabled] = useState(false);
    const [step3Complete, setStep3Complete] = useState(false);
    const [allMetricsSet, setAllMetricsSet] = useState(false);

    const handleStep1Completion = (isComplete: boolean): void => {
        setStep1Complete(isComplete);
    };

    const handleStep1Next = (): void => {
        if (step1Complete) {
            setStep2Enabled(true);
        }
    };

    const handleStep2Completion = (isChartSelected: boolean): void => {
        setStep2Complete(isChartSelected);
    };

    const handleStep2Next = (): void => {
        if (step2Complete) {
            setStep3Enabled(true);
        }
    };

    const handleStep3Completion = (isChartSelected: boolean): void => {
        setStep3Complete(isChartSelected);
    };

    const handleStep3Next = (): void => {
        if (step3Complete) {
            setAllMetricsSet(true);
        }
    };

 

    return (
        <div>
            <Title level="2">{t('charts.setMetrics')}</Title>
            <Card className="p-6">
                <div className="mb-6">
                    <Step1
                        onCompletionChange={handleStep1Completion}
                        onNext={handleStep1Next}
                    />
                </div>

                <div
                    className={`${!step2Enabled ? 'pointer-events-none opacity-50' : ''} mb-6`}
                >
                    <Step2
                        onCompletionChange={handleStep2Completion}
                        onNext={handleStep2Next}
                        disabled={!step2Enabled}
                    />
                </div>

                <div
                    className={`${!step3Enabled ? 'pointer-events-none opacity-50' : ''}`}
                >
                    <Step3
                        disabled={!step3Enabled}
                        onCompletionChange={handleStep3Completion}
                        onNext={handleStep3Next}
                        onExploreCharts={onExploreCharts}
                    />
                </div>
            </Card>
        </div>
    );
}
