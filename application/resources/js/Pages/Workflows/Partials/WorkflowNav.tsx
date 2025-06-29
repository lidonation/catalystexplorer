import Title from '@/Components/atoms/Title';
import { StepDetails } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type NavProps = {
    stepDetails: StepDetails[];
    activeStep: number;
};

export default function Nav({ stepDetails, activeStep }: NavProps) {
    const { t } = useTranslation();
    const [progress, setProgress] = useState(0);

    const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

    useEffect(() => {
        setProgress((activeStep / stepDetails.length) * 100);
    }, [activeStep, stepDetails]);

    useEffect(() => {
        const activeEl = stepRefs.current[activeStep - 1];
        if (activeEl) {
            activeEl.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }
    }, [activeStep]);

    if (!stepDetails) return null;

    const hasFewSteps = stepDetails.length <= 4;

    const formatStepNumber = (num: number) => {
        return num.toString().padStart(2, '0');
    };

    return (
        <div className="bg-background sticky top-0 z-30">
            <nav className="bg-background w-full rounded-tl-lg px-4 pt-2 shadow-md lg:px-8 lg:pt-4">
                <ul
                    className={`menu-gap-y no-scrollbar flex w-full overflow-x-auto pb-3 whitespace-nowrap ${
                        hasFewSteps ? 'justify-between' : 'justify-between'
                    }`}
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
                                ? 'flex-grow flex justify-center mx-4 lg:mx-6'
                                : '';
                        const spacingClass =
                            !hasFewSteps && !isFirstItem && !isLastItem
                                ? 'mx-2 md:mx-4 lg:mx-6'
                                : '';

                        const stepItemClass = `flex-shrink-0 ${
                            hasFewSteps ? 'px-4' : 'px-2'
                        } ${positionClass} ${flexClass} ${spacingClass}`;

                        const commonContent = (
                            <div className="flex items-center gap-2">
                                <div
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold lg:h-10 lg:w-10 ${
                                        index + 1 < activeStep
                                            ? 'bg-primary text-white'
                                            : index + 1 === activeStep
                                              ? 'border-primary text-primary border'
                                              : 'text-slate border'
                                    }`}
                                >
                                    <span>{formatStepNumber(index + 1)}</span>
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
            <div className="relative h-1 w-full overflow-hidden rounded-md">
                <div
                    className="bg-primary border-primary absolute top-0 left-0 h-full border-t-3 transition-all duration-500 ease-in-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}
