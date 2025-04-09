import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { useLocalizedRoute } from '@/utils/localizedRoute';

import WorkflowLayout from '../WorkflowLayout';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import WorkflowTable from './WorkflowTable';
import { FiltersProvider } from '@/Context/FiltersContext';
import { StepDetails } from '@/types';
import { PaginatedData } from '../../../../types/paginated-data';
import { SearchParams } from '../../../../types/search-params';

interface ProposalSubmissionStatus {
    slug: string;
    title: string;
    fund: string;
    requested_funds?: string;
    status: 'submitted' | 'submitting';
}

interface Step5Props {
    stepDetails: StepDetails[];
    activeStep: number;
    proposals: PaginatedData<ProposalSubmissionStatus[]>;
    filters: SearchParams;
}

const Step5: React.FC<Step5Props> = ({
                                         stepDetails,
                                         activeStep,
                                         proposals,
                                         filters
                                     }) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.voting.index', { step: activeStep - 1 });

    const columns = [
        {
            key: 'index',
            header: 'No.'
            // The index is handled automatically by WorkflowTable
        },
        {
            key: 'fund',
            header: 'Fund'
        },
        {
            key: 'title',
            header: 'Proposal'
        },
        {
            key: 'budget',
            header: 'Budget',
            render: (item: ProposalSubmissionStatus) => item.requested_funds || '75K ADA'
        },
        {
            key: 'status',
            header: 'Vote',
            render: (item: ProposalSubmissionStatus) => (
                <div className={`
                    px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded
                    ${item.status === 'submitted' ? 'bg-success text-white' : 'bg-warning text-white'}
                `}>
                    {item.status === 'submitted' ? 'Submitted' : 'Submitting...'}
                </div>
            )
        }
    ];

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{
                preserveState: true,
                replace: true
            }}
        >
            <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
                <Nav stepDetails={stepDetails} activeStep={activeStep} />

                <Content>
                    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                        {/* WorkflowTable now handles the paginated data directly */}
                        <WorkflowTable
                            items={proposals}
                            columns={columns}
                            keyExtractor={(item) => item.slug}
                            emptyState={{
                                context: 'proposals',
                                showIcon: true
                            }}
                        />
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
                        disabled={!proposals.data.every(proposal => proposal.status === 'submitted')}
                        onClick={() => {
                            window.location.href = localizedRoute('workflows.voting.index', { step: 6 });
                        }}
                    >
                        <span>{t('Complete')}</span>
                    </PrimaryButton>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step5;
