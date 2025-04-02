import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { t } from 'i18next';
import { Check, ChevronLeft } from 'lucide-react';
import React from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';

interface Step5Props {
    stepDetails: StepDetails[];
    activeStep: number;
    voterList: any;
}

const Step5: React.FC<Step5Props> = ({
    stepDetails,
    activeStep,
    voterList,
}) => {
    const form = useForm({});
    
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
    });

    const submitList = () => {
        form.post(generateLocalizedRoute('workflows.createVoterList.finalize'));
    };

    const proposalCount = voterList?.proposals?.length || 0;

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="p-6 lg:p-8">
                    <Title level="2" className="mb-6 text-xl font-semibold">
                        {t('Review Your Voting List')}
                    </Title>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 max-w-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">{t('List Name')}</h3>
                                <p className="font-medium">{voterList?.name}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">{t('Visibility')}</h3>
                                <p className="font-medium capitalize">{voterList?.visibility}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">{t('Fund')}</h3>
                                <p className="font-medium">{voterList?.fund?.title}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">{t('Proposals')}</h3>
                                <p className="font-medium">{proposalCount} {proposalCount === 1 ? t('proposal') : t('proposals')}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('Selection Criteria')}</h3>
                            <p className="text-gray-700 whitespace-pre-line">{voterList?.criteria}</p>
                        </div>
                    </div>
                    
                    <Title level="3" className="mb-4 text-lg font-medium">
                        {t('Selected Proposals')}
                    </Title>
                    
                    <div className="space-y-4 mb-8">
                        {voterList?.proposals && voterList.proposals.length > 0 ? (
                            voterList.proposals.map((proposal: any) => (
                                <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="mb-2">
                                        <h4 className="font-medium">{proposal.title}</h4>
                                        <p className="text-sm text-gray-600">{proposal.campaign?.title}</p>
                                    </div>
                                    {voterList.rationales[proposal.id] && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <h5 className="text-sm font-medium text-gray-500 mb-1">{t('Your Rationale')}</h5>
                                            <p className="text-sm text-gray-700">{voterList.rationales[proposal.id]}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-600 p-4 border border-gray-200 rounded-lg">
                                <Paragraph>{t('No proposals selected')}</Paragraph>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 rounded-full p-1 mt-0.5">
                                <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-green-800">{t('Ready to Publish')}</h3>
                                <p className="text-sm text-green-700">
                                    {t('Your voting list is ready to be published. Click the button below to create it.')}
                                </p>
                            </div>
                        </div>
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
                    className="text-sm lg:px-8 lg:py-3 bg-green-600 hover:bg-green-700"
                    onClick={submitList}
                >
                    <span>{t('Publish Voting List')}</span>
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step5;