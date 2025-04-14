import Title from '@/Components/atoms/Title';
import { StepDetails } from '@/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type NavProps = {
    stepDetails: StepDetails[];
    activeStep: number;
};
export default function Nav({ stepDetails, activeStep }: NavProps) {
    const { t } = useTranslation();
    const [progress, setProgress] = useState(0);

    if (!stepDetails) {
        return null;
    }

    useEffect(() => {
        setProgress((activeStep / stepDetails.length) * 100);
    }, [activeStep, stepDetails]);

    const hasFewSteps = stepDetails.length <= 4;

    return (
        <div className="bg-background sticky top-0 z-30">
            <nav className="bg-background w-full rounded-tl-lg px-4 pt-2 shadow-md lg:px-8 lg:pt-4">
                <ul className={`
                    scrollbar-thin scrollbar-track flex w-full overflow-x-auto pb-3 whitespace-nowrap
                    ${hasFewSteps ? 'justify-between' : ''}
                `}>
                    {stepDetails.map((step, index) => {
                        const marginClass = !hasFewSteps && index > 0 ? "ml-6 md:ml-8" : "";
                        const stepItemClass = `flex-shrink-0 ${hasFewSteps ? 'px-4' : 'px-2 min-w-fit'}`;

                        if (index + 1 < activeStep) {
                            return (
                                <li key={index} className={`${stepItemClass} ${marginClass}`}>
                                    <div className="flex gap-2 items-center">
                                        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full font-bold lg:h-10 lg:w-10 flex-shrink-0">
                                            <span>{index + 1}</span>
                                        </div>
                                        <div>
                                            <Title
                                                level="6"
                                                className="text-white font-semibold whitespace-nowrap"
                                            >
                                                {t(step.title)}
                                            </Title>
                                            <span className="text-slate whitespace-nowrap">
                                                {t('Step') + (index + 1)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            );
                        } else if (index + 1 === activeStep) {
                            return (
                                <li key={index} className={`${stepItemClass} ${marginClass}`}>
                                    <div className="flex gap-2 items-center">
                                        <div className="border-primary text-primary flex h-8 w-8 items-center justify-center rounded-full border font-bold lg:h-10 lg:w-10 flex-shrink-0">
                                            <span>{index + 1}</span>
                                        </div>
                                        <div>
                                            <Title
                                                level="6"
                                                className="text-primary font-semibold whitespace-nowrap"
                                            >
                                                {t(step.title)}
                                            </Title>
                                            <span className="text-slate whitespace-nowrap">
                                                {t(`Step ${index + 1}`)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            );
                        } else {
                            return (
                                <li key={index} className={`${stepItemClass} ${marginClass}`}>
                                    <div className="flex gap-2 items-center">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full border font-bold lg:h-10 lg:w-10 flex-shrink-0">
                                            <span>{index + 1}</span>
                                        </div>
                                        <div>
                                            <Title
                                                level="6"
                                                className="text-slate font-semibold whitespace-nowrap"
                                            >
                                                {t(step.title)}
                                            </Title>
                                            <span className="text-slate whitespace-nowrap">
                                                {t(`Step ${index + 1}`)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            );
                        }
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
