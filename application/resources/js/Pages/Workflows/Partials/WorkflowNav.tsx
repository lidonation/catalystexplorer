import Title from '@/Components/atoms/Title';
import TickIcon from '@/Components/svgs/TickIcon';
import { StepDetails } from '@/types';
import { useEffect, useRef, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

type NavProps = {
    stepDetails: StepDetails[];
    activeStep: number;
};

export default function Nav({ stepDetails, activeStep }: NavProps) {
    const { t } = useLaravelReactI18n();
    const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
    const [animatedSteps, setAnimatedSteps] = useState<Set<number>>(new Set());

    useEffect(() => {
        const activeEl = stepRefs.current[activeStep - 1];
        if (activeEl) {
            activeEl.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }

        const timer = setTimeout(() => {
            setAnimatedSteps(prev => new Set([...prev, activeStep]));
        }, 100);

        return () => clearTimeout(timer);
    }, [activeStep]);

    if (!stepDetails) return null;

    const hasFewSteps = stepDetails.length <= 4;

    const formatStepNumber = (num: number) => {
        return num.toString();
    };

    return (
        <div className="bg-background sticky top-0 z-30">
            <nav className="bg-background w-full rounded-tl-lg shadow-md" data-testid="workflow-nav">
                <ul
                    className={` no-scrollbar flex w-full overflow-x-auto whitespace-nowrap`}
                >
                    {stepDetails.map((step, index) => {
                        const isFirstItem = index === 0;
                        const isLastItem = index === stepDetails.length - 1;

                        let positionClass = '';
                        if (!hasFewSteps) {
                            if (isFirstItem) positionClass = 'ml-0';
                            if (isLastItem) positionClass = 'ml-auto';
                        }

                        const flexClass =
                            !hasFewSteps && !isFirstItem && !isLastItem
                                ? ''
                                : '';
                        const spacingClass =
                            !hasFewSteps && !isFirstItem && !isLastItem
                                ? ''
                                : '';

                        const stepItemClass = `${
                            hasFewSteps ? 'flex-1' : 'flex-shrink-0'
                        } relative ${
                            hasFewSteps ? 'px-0' : 'px-0'
                        } ${positionClass} ${flexClass} ${spacingClass}`;

                        const getProgressWidth = () => {
                            if (index + 1 < activeStep) {
                                return '100%';
                            } else if (index + 1 === activeStep && animatedSteps.has(activeStep)) {
                                return '100%';
                            } else if (isLastItem && activeStep >= stepDetails.length) {
                                return '100%';
                            } else {

                                return '0%';
                            }
                        };

                        const getProgressDelay = () => {
                            if (index + 1 === activeStep) {
                                return 'delay-75';
                            }
                            return '';
                        };

                        const commonContent = (
                            <div className="relative h-full">
                                <div className={`flex items-center gap-3 py-4 ${hasFewSteps ? 'justify-center px-4' : 'px-8'}`}>
                                    <div
                                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                                            index + 1 < activeStep
                                                ? 'bg-primary text-white'
                                                : index + 1 === activeStep
                                                  ? 'border-primary text-primary border'
                                                  : 'text-slate border'
                                        }`}
                                        data-testid={`step-number-${index + 1}`}
                                    >
                                        {index + 1 < activeStep ? (
                                            <TickIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                                        ) : (
                                            <span>{formatStepNumber(index + 1).padStart(2, '0')}</span>
                                        )}
                                    </div>
                                    <div>
                                        <Title
                                            level="6"
                                            className={`font-semibold whitespace-nowrap ${
                                                index + 1 < activeStep
                                                    ? 'text-primary'
                                                    : index + 1 === activeStep
                                                      ? 'text-primary'
                                                      : 'text-slate'
                                            }`}
                                        >
                                            {t(step.title)}
                                        </Title>
                                        <span className="text-slate whitespace-nowrap">
                                            {t(
                                                `Step ${formatStepNumber(index + 1)}`,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 overflow-hidden">
                                    <div
                                        className={`h-full bg-primary transition-all duration-[1500ms] ease-out ${getProgressDelay()}`}
                                        style={{
                                            width: getProgressWidth(),
                                        }}
                                    />
                                </div>
                            </div>
                        );

                        return (
                            <li
                                key={index}
                                className={stepItemClass}
                                ref={(el) => (stepRefs.current[index] = el)}
                            >
                                {commonContent}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
