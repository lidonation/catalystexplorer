import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import { StepDetails } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { t } from 'i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ConnectWalletList from '@/Components/ConnectWalletList';

interface Step1Props {
    profile: IdeascaleProfileData;
    stepDetails: StepDetails[];
    activeStep: number;
}

const Step2: React.FC<Step1Props> = ({ stepDetails, activeStep }) => {
    const localizedRoute = useLocalizedRoute;

    const {
        connectedWallet,
        connectedWalletProvider,
        userAddress,
        stakeKey,
        stakeAddress,
        networkName,
        networkId,
         extractSignature 
    } = useConnectWallet();

    const signature = '';

    const submitSignature = () => {
        
    };

    const prevStep =
        activeStep === 1
            ? ''
            : localizedRoute('workflows.drepSignUp.index', {
                  step: activeStep + 1,
              });

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="mx-auto w-full max-w-3xl">
                    <ConnectWalletList />
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
                    disabled={!userAddress}
                    onClick={() => (userAddress ? submitSignature() : '')}
                >
                    <span>{t('profileWorkflow.next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;
