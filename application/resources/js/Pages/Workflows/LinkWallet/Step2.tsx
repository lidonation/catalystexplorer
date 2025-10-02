import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import WalletCard from './Partials/WalletCard';

interface WalletStats {
    all_time_votes: number;
    stakeAddress: string;
    funds_participated: string[];
    balance: string;
    status?: boolean;
}

interface WalletData {
    id: string;
    name: string;
    networkName: string;
    stakeAddress: string;
    userAddress: string;
    paymentAddresses?: string[];
    walletDetails: WalletStats;
    catId: string;
}

interface Step2Props {
    stepDetails: StepDetails[];
    activeStep: number;
    proposal: App.DataTransferObjects.ProposalData;
    wallet: WalletData;
}

const Step2: React.FC<Step2Props> = ({
    stepDetails,
    activeStep,
    proposal,
    wallet,
}) => {
    const { t } = useLaravelReactI18n();
    const [copySuccesses, setCopySuccesses] = useState<Record<string, boolean>>(
        {},
    );
    const [expandedAddresses, setExpandedAddresses] = useState<
        Record<string, boolean>
    >({});
    const localizedRoute = useLocalizedRoute;

    const prevStep =
        activeStep === 1
            ? ''
            : localizedRoute('workflows.linkWallet.index', {
                  step: activeStep - 1,
                  proposal,
              });

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value).then(() => {
            setCopySuccesses((prev) => ({ ...prev, [value]: true }));
            setTimeout(() => {
                setCopySuccesses((prev) => ({ ...prev, [value]: false }));
            }, 2000);
        });
    };

    const toggleAddressExpansion = (walletId: string) => {
        setExpandedAddresses((prev) => ({
            ...prev,
            [walletId]: !prev[walletId],
        }));
    };

    const connectWallet = () => {
        router.post(
            generateLocalizedRoute('workflows.linkWallet.connectWalletToProposal', {
                proposal: proposal?.id,
                stakeAddress: wallet?.stakeAddress,
            }),
            {},
            {
                onError: (errors) => {
                    toast.error(t('workflows.signature.errors.unknownError'), {
                        className: 'bg-background text-content',
                    });
                },
            },
        );
    };

    return (
        <WorkflowLayout
            title="Link Wallet"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
            wrapperClassName="!h-auto"
            contentClassName="!max-h-none"
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="flex w-full flex-col py-8">
                    {wallet ? (
                        <div className="h-full w-full px-8">
                            <div className="grid grid-cols-1">
                                <WalletCard
                                    wallet={wallet}
                                    copySuccesses={copySuccesses}
                                    expandedAddresses={expandedAddresses}
                                    onCopy={handleCopy}
                                    onToggleAddressExpansion={
                                        toggleAddressExpansion
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <RecordsNotFound />
                        </div>
                    )}
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
                    <span>{t('previous')}</span>
                </PrimaryLink>
                <PrimaryButton
                    className="text-sm lg:px-8 lg:py-3"
                    onClick={connectWallet}
                >
                    <span>{t('project.status.complete')}</span>
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;
