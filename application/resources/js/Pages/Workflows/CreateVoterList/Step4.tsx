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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';

interface Step4Props {
    stepDetails: StepDetails[];
    activeStep: number;
    selectedProposals: any[];
    rationales: Record<string, string>;
}

const Step4: React.FC<Step4Props> = ({
    stepDetails,
    activeStep,
    selectedProposals = [],
    rationales = {},
}) => {
    const form = useForm({
        rationales: rationales || {},
        criteria: '',
    });
    
    const [isFormValid, setIsFormValid] = useState(false);

    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
    });

    const validateForm = () => {
        const hasMainCriteria = !!form.data.criteria;
        // Not requiring rationales for every proposal, but we need the main criteria
        setIsFormValid(hasMainCriteria);
    };

    const handleRationaleChange = (proposalId: string, value: string) => {
        const updatedRationales = {
            ...form.data.rationales,
            [proposalId]: value,
        };
        form.setData('rationales', updatedRationales);
        validateForm();
    };

    const submitForm = () => {
        form.post(generateLocalizedRoute('workflows.createVoterList.saveRationales'));
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="p-6 lg:p-8">
                    <Title level="2" className="mb-6 text-xl font-semibold">
                        {t('Add Selection Criteria')}
                    </Title>
                    
                    <div className="mb-8 max-w-3xl">
                        <label htmlFor="criteria" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('Main Selection Criteria')}*
                        </label>
                        <textarea
                            id="criteria"
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder={t('Explain your overall criteria for selecting these proposals...')}
                            rows={4}
                            value={form.data.criteria}
                            onChange={(e) => {
                                form.setData('criteria', e.target.value);
                                validateForm();
                            }}
                            required
                        />
                        {form.errors.criteria && (
                            <p className="mt-1 text-sm text-red-600">{form.errors.criteria}</p>
                        )}
                    </div>
                    
                    <Title level="3" className="mb-4 text-lg font-medium">
                        {t('Proposal-Specific Rationales')} <span className="text-sm font-normal text-gray-500">(Optional)</span>
                    </Title>
                    
                    <div className="space-y-6">
                        {selectedProposals && selectedProposals.length > 0 ? (
                            selectedProposals.map((proposal) => (
                                <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="mb-3">
                                        <h4 className="font-medium">{proposal.title}</h4>
                                        <p className="text-sm text-gray-600">{proposal.campaign?.title}</p>
                                    </div>
                                    <textarea
                                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder={t('Why did you select this proposal? (Optional)')}
                                        rows={2}
                                        value={form.data.rationales[proposal.id] || ''}
                                        onChange={(e) => handleRationaleChange(proposal.id, e.target.value)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-600 p-4 border border-gray-200 rounded-lg">
                                <Paragraph>{t('No proposals selected')}</Paragraph>
                            </div>
                        )}
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
                    disabled={!isFormValid}
                    onClick={submitForm}
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step4;