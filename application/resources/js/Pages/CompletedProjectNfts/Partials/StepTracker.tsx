import TickIcon from '@/Components/svgs/TickIcon';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';

interface StepTrackerProps {
    totalSteps: number;
    currentStep: number;
    activeColor?: string;
    inactiveColor?: string;
    activeTextColor?: string;
    inactiveTextColor?: string;
    inactiveConnectorColor?: string;
    borderActiveColor?: string;
    borderInactiveColor?: string;
}

const StepTracker: React.FC<StepTrackerProps> = ({
    totalSteps,
    currentStep,
    activeColor = 'bg-primary',
    inactiveColor = 'bg-transparent',
    activeTextColor = 'text-primary',
    inactiveTextColor = 'text-dark',
    inactiveConnectorColor = 'bg-dark',
    borderActiveColor = 'border-primary',
    borderInactiveColor = 'border-dark',
}) => {
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

    const { t } = useLaravelReactI18n();

    return (
        <div className="flex w-full items-center justify-center px-4 sm:px-6">
            <div className="flex w-full max-w-xs items-center justify-center p-2">
                {steps.map((stepNumber, index) => (
                    <React.Fragment key={stepNumber}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${stepNumber <= currentStep ? activeColor : inactiveColor} ${stepNumber <= currentStep ? borderActiveColor : `border-2 ${borderInactiveColor}`}`}
                            >
                                {stepNumber <= currentStep ? (
                                    <TickIcon
                                        width={16}
                                        className="text-background"
                                    />
                                ) : (
                                    <p
                                        className={`truncate text-xs sm:text-sm ${stepNumber <= currentStep ? activeTextColor : 'text-content'}`}
                                    >
                                        {String(stepNumber).padStart(2, '0')}
                                    </p>
                                )}
                            </div>

                            <p
                                className={`mt-2 truncate text-xs sm:text-sm ${stepNumber <= currentStep ? activeTextColor : inactiveTextColor}`}
                            >
                                {`${t('completedProjectNfts.step')} ${stepNumber}`}
                            </p>
                        </div>

                        {index < steps.length - 1 && (
                            <div className={'h-8 flex-1'}>
                                <div
                                    className={`mx-2 h-1 flex-1 ${
                                        stepNumber < currentStep
                                            ? activeColor
                                            : inactiveConnectorColor
                                    }`}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default StepTracker;
