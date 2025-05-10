import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import ConnectWalletList from '@/Components/ConnectWalletList';

interface Step1Props {
    stepDetails: any[];
    activeStep: number;
}

const Step1: React.FC<Step1Props> = ({ stepDetails, activeStep }) => {
    const { t } = useTranslation();
    const nextStep = generateLocalizedRoute('workflows.signature.index', {
        step: activeStep + 1,
    });
    const signMessageRoute = generateLocalizedRoute(
        'workflows.signature.signMessage',
    );

    const {
        connectedWallet,
        connectedWalletProvider,
        userAddress,
        stakeKey,
        stakeAddress,
        networkName,
        networkId,
    } = useConnectWallet();

    const handleNext = () => {
        router.post(
            signMessageRoute,
            {
                wallet: connectedWalletProvider?.name || '',
                walletAddress: userAddress,
                network: networkName,
                networkId: networkId ? String(networkId) : null,
                stake_key: stakeKey,
                stake_address: stakeAddress,
            },
            {
                onSuccess: () => {
                    router.visit(nextStep);
                },
                onError: (errors) => {
                    console.error('Wallet connection errors:', errors);
                },
            },
        );
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="mx-auto w-full max-w-3xl">
                    <ConnectWalletList />
                </div>
            </Content>

            <Footer>
                <div></div>
                <PrimaryLink
                    href={connectedWallet ? nextStep : ''}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={!connectedWallet}
                    onClick={(e) => {
                        e.preventDefault();
                        if (connectedWallet) {
                            handleNext();
                        }
                    }}
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step1;
