import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';

import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import WorkflowLayout from '../WorkflowLayout';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';

import { StepDetails } from '@/types';
import { SubmitIcon } from "@/Components/svgs/SubmitIcon";
import {useConnectWallet} from "@/Context/ConnectWalletSliderContext";
import {VoteEnum} from "@/enums/votes-enums";

interface ProposalType {
    slug: string;
    title: string;
    fund?: {
        title: string;
    };
    requested_funds?: string;
    vote?: VoteEnum;
}
interface Step4Props {
    stepDetails: StepDetails[];
    activeStep: number;
    wallet?: string;
    selectedProposals?: [];
    votes?: Record<string, VoteEnum>;
}

const Step4: React.FC<Step4Props> = ({
                                         stepDetails,
                                         activeStep,
                                         wallet,
                                         selectedProposals = [],
                                         votes = {}
                                     }) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.voting.index', { step: activeStep - 1 });
    const successRoute = localizedRoute('workflows.voting.index', { step: activeStep + 1 });
    const submitRoute = localizedRoute('workflows.voting.submitVotes');
    const { stakeKey, stakeAddress } = useConnectWallet();
    const form = useForm({
        stake_key: stakeKey,
        stake_address: stakeAddress
    });

    const submitVotes = () => {
        form.post(submitRoute, {
            onSuccess: () => {
                router.visit(successRoute);
            },
            onError: (errors) => {
                console.error('Submit errors:', errors);
            }
        });
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="max-w-3xl mx-auto w-full">
                    <div className="p-6 rounded-lg flex flex-col items-center justify-center">
                        <Title level="4" className="mb-6 text-center">{t('workflows.voting.steps.readyToVote')}</Title>
                        <SubmitIcon size={100} />

                        <Paragraph className="text-center italic text-gray-persist my-4">
                            {t('workflows.voting.steps.submitReviewedVotes')}
                        </Paragraph>

                        <PrimaryButton
                            className="px-8 py-3 w-full max-w-md"
                            onClick={submitVotes}
                            disabled={!wallet}
                        >
                            {t('workflows.voting.steps.submitVotes')}
                        </PrimaryButton>
                    </div>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryButton
                    className="text-sm lg:px-8 lg:py-3"
                    onClick={submitVotes}
                    disabled={!wallet}
                >
                    <span>{t('Complete')}</span>
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step4;
