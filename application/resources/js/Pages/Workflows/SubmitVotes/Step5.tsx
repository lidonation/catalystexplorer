import React, {useCallback} from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import {generateLocalizedRoute, useLocalizedRoute} from '@/utils/localizedRoute';

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
import { VoteEnum } from '@/enums/votes-enums';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import {currency} from "@/utils/currency";

interface ProposalSubmissionStatus {
    slug: string;
    title: string;
    fund: string;
    requested_funds?: string;
    status: 'submitted' | 'submitting';
    vote?: number;
}

interface Step5Props {
    stepDetails: StepDetails[];
    activeStep: number;
    proposals: PaginatedData<ProposalSubmissionStatus[]>;
    filters: SearchParams;
    votes?: Record<string, number>;
}

const Step5: React.FC<Step5Props> = ({
                                         stepDetails,
                                         activeStep,
                                         proposals,
                                         filters,
                                         votes = {}
                                     }) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const prevStep = generateLocalizedRoute('workflows.voting.index', { step: activeStep - 1 });
    const formatCurrency = (
        amount: number | string | null | undefined,
        currencyCode: string = 'ADA'
    ): string => {
        return currency(
            amount ? parseInt(amount.toString()) : 0,
            2,
            currencyCode
        ) as string;
    };

    const votesForTable: Record<string, VoteEnum> = {};
    Object.keys(votes).forEach(slug => {
        if (votes[slug] === 0) votesForTable[slug] = VoteEnum.NO;
        else if (votes[slug] === 1) votesForTable[slug] = VoteEnum.YES;
        else votesForTable[slug] = VoteEnum.ABSTAIN;
    });
    const handleComplete = useCallback(() => {
        console.log('Votes being completed:', votes);
        console.log('Formatted votes for table:', votesForTable);
        const successStep = generateLocalizedRoute('workflows.voting.index', { step: 6 });
        window.location.href = successStep;
    }, []);

    const columns = [
        {
            key: 'index',
            header: 'No.'
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
            render: (item: ProposalSubmissionStatus) => {
                const amountRequested = item.requested_funds || '75000';
                const currencyCode = 'ADA';
                return formatCurrency(amountRequested, currencyCode);
            }
        },
        {
            key: 'vote',
            header: 'Vote',
            render: (item: ProposalSubmissionStatus) => (
                <div className={`
                    px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded
                    ${item.status === 'submitted' ? 'bg-success text-white' : 'bg-warning text-white'}
                `}>
                    {item.status === 'submitted' ? 'Submitted' : 'Submitted'}
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
                        <WorkflowTable
                            items={proposals}
                            columns={columns}
                            keyExtractor={(item) => item.slug}
                            votesMap={votesForTable}
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
                        onClick={handleComplete}
                    >
                        <span>{t('Complete')}</span>
                    </PrimaryButton>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step5;
