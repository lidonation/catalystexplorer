import Title from '@/Components/atoms/Title';
import TickIcon from '@/Components/svgs/TickIcon';
import { StepDetails } from '@/types';
import { useTranslation } from 'react-i18next';


type NavProps = {
    stepDetails: StepDetails[];
};
export default function Nav({ stepDetails }: NavProps) {
    const { t } = useTranslation();

    if (!stepDetails) {
        return;
    }

    return (
        <>
            <nav className="w-full gap-4 rounded-tl-lg px-8 pt-4">
                <ul className="menu-gap-y flex w-full pb-3">
                    <li className="flex-1">
                        <div className="flex gap-2">
                            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full">
                                <TickIcon className="text-white" />
                            </div>
                            <div>
                                <Title level="6" className="font-semibold">
                                    {t('Title')}
                                </Title>
                                <span className="text-slate">
                                    {t('Step 1')}
                                </span>
                            </div>
                        </div>
                    </li>
                    <li className="flex-1">
                        <div className="flex gap-2">
                            <div className="border-primary text-primary flex h-10 w-10 items-center justify-center rounded-full border">
                                <span className="">02</span>
                            </div>
                            <div>
                                <Title
                                    level="6"
                                    className="text-primary font-semibold"
                                >
                                    {t('Title')}
                                </Title>
                                <span className="text-slate">
                                    {t('Step 2')}
                                </span>
                            </div>
                        </div>
                    </li>
                    <li className="flex-1">
                        <div className="flex gap-2">
                            <div className="border-slate text-slate flex h-10 w-10 items-center justify-center rounded-full border">
                                <span className="">03</span>
                            </div>
                            <div>
                                <Title
                                    level="6"
                                    className="text-slate font-semibold"
                                >
                                    {t('Title')}
                                </Title>
                                <span className="text-slate">
                                    {t('Step 3')}
                                </span>
                            </div>
                        </div>
                    </li>
                </ul>
            </nav>
            <div className="border-primary w-2/3 border-t-3"></div>
        </>
    );
}
