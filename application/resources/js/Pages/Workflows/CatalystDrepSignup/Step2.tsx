import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import ConnectWalletList from '@/Components/ConnectWalletList';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { t } from 'i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import CatalysDrepData = App.DataTransferObjects.CatalystDrepData;

interface Step1Props {
    catalystDrep: string;
    stepDetails: StepDetails[];
    activeStep: number;
}

const Step2: React.FC<Step1Props> = ({
    stepDetails,
    activeStep,
    catalystDrep,
}) => {
    const localizedRoute = useLocalizedRoute;

    const { stakeKey, stakeAddress } = useConnectWallet();

    const [error, setError] = useState<string>('');

    const prevStep =
        activeStep === 1
            ? ''
            : localizedRoute('workflows.drepSignUp.index', {
                  step: activeStep - 1,
                  catalystDrep,
              });

    const verifyWallet = () => {
        router.post(
            generateLocalizedRoute('workflows.drepSignUp.validateWallet', {
                catalystDrep,
            }),
            { stakeAddress },
            {
                onError: (errors) => setError(errors.message),
            },
        );
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="mx-auto w-full max-w-3xl px-4">
                    <ConnectWalletList />
                    <div
                        className={`bg-danger-light container mt-6 transform overflow-hidden rounded-lg py-3 text-center transition-all duration-500 ease-in-out ${
                            error.length
                                ? 'border-danger-strong max-w-full translate-x-0 border px-6'
                                : 'max-w-0 translate-x-full px-0'
                        }`}
                    >
                        <p className=" text-slate-500 lg:min-w-max">
                            {t(error)}
                        </p>
                    </div>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={activeStep == 1}
                    onClick={(e) => activeStep == 1 && e.preventDefault()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryButton
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={!stakeAddress}
                    onClick={() => (stakeAddress ? verifyWallet() : '')}
                >
                    <span>{t('profileWorkflow.next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;
