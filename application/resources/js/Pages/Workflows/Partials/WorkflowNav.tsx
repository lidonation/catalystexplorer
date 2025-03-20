import Title from '@/Components/atoms/Title';
import TickIcon from '@/Components/svgs/TickIcon';
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
        return;
    }
    
    useEffect(() => {
        setProgress((activeStep / stepDetails.length) * 75);
    }, [activeStep, stepDetails]);

    return (
        <div className="sticky top-16 z-50 lg:static lg:z-auto">
            <nav className="bg-background w-full gap-4 rounded-tl-lg px-4 pt-2 shadow-md lg:px-8 lg:pt-4">
                <ul className="menu-gap-y flex w-full overflow-x-auto pb-3 whitespace-nowrap">
                    {stepDetails.map((step, index) => {
                        if (index + 1 < activeStep) {
                            return (
                                <li key={index} className="lg:flex-1">
                                    <div className="flex gap-2">
                                        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full font-bold text-white lg:h-10 lg:w-10">
                                            <span>{index + 1}</span>
                                        </div>
                                        <div>
                                            <Title
                                                level="6"
                                                className="font-semibold"
                                            >
                                                {step.title}
                                            </Title>
                                            <span className="text-slate">
                                                {t('Step') + (index + 1)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            );
                        } else if (index + 1 === activeStep) {
                            return (
                                <li key={index} className="lg:flex-1">
                                    <div className="flex gap-2">
                                        <div className="border-primary text-primary flex h-8 w-8 items-center justify-center rounded-full border font-bold lg:h-10 lg:w-10">
                                            <span>{index + 1}</span>
                                        </div>
                                        <div>
                                            <Title
                                                level="6"
                                                className="text-primary font-semibold"
                                            >
                                                {step.title}
                                            </Title>
                                            <span className="text-slate">
                                                {t(`Step ${index + 1}`)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            );
                        } else {
                            return (
                                <li key={index} className="lg:flex-1">
                                    <div className="flex gap-2">
                                        <div className="border-slate text-slate flex h-8 w-8 items-center justify-center rounded-full border font-bold lg:h-10 lg:w-10">
                                            <span>{index + 1}</span>
                                        </div>
                                        <div>
                                            <Title
                                                level="6"
                                                className="text-slate font-semibold"
                                            >
                                                {step.title}
                                            </Title>
                                            <span className="text-slate">
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
