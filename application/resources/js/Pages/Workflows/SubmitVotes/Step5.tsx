import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { ChevronLeft } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { FiltersProvider } from '@/Context/FiltersContext';
import { VoteEnum } from '@/enums/votes-enums';
import { StepDetails } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { currency } from '@/utils/currency';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import WorkflowTable from './WorkflowTable';

interface ProposalSubmissionStatus {
    slug: string;
    title: string;
    fund?: {
        title: string;
    };
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
    votes = {},
}) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const prevStep = generateLocalizedRoute('workflows.voting.index', {
        step: activeStep - 1,
    });

    const formatCurrency = (
        amount: number | string | null | undefined,
        currencyCode: string = 'ADA',
    ): string => {
        return currency(
            amount ? parseInt(amount.toString()) : 0,
            2,
            currencyCode,
        ) as string;
    };

    const votesForTable: Record<string, VoteEnum> = {};
    Object.keys(votes).forEach((slug) => {
        if (votes[slug] === 0) votesForTable[slug] = VoteEnum.NO;
        else if (votes[slug] === 1) votesForTable[slug] = VoteEnum.YES;
        else votesForTable[slug] = VoteEnum.ABSTAIN;
    });

    const handleComplete = useCallback(() => {
        const successStep = generateLocalizedRoute('workflows.voting.index', {
            step: 6,
        });
        window.location.href = successStep;
    }, []);

    const columns = [
        {
            key: 'index',
            header: 'No.',
            render: (_: ProposalSubmissionStatus, index: number) => index + 1,
        },
        {
            key: 'fund',
            header: 'Fund',
            render: (item: ProposalSubmissionStatus) => {
                // Handle both string and object fund structures
                if (typeof item.fund === 'string') {
                    return item.fund || '-';
                } else if (item.fund && typeof item.fund === 'object') {
                    return item.fund.title || '-';
                }
                return '-';
            },
        },
        {
            key: 'title',
            header: 'Proposal',
        },
        {
            key: 'budget',
            header: 'Budget',
            render: (item: ProposalSubmissionStatus) => {
                const amountRequested = item.requested_funds || '0';
                const currencyCode = 'ADA';
                return formatCurrency(amountRequested, currencyCode);
            },
        },
        {
            key: 'vote',
            header: 'Vote',
            render: (item: ProposalSubmissionStatus) => (
                <span
                    className={`inline-flex rounded-md px-4 py-2 text-sm font-medium ${
                        item.status === 'submitted'
                            ? 'bg-green-500 text-white'
                            : 'bg-orange-400 text-white'
                    }`}
                >
                    {item.status === 'submitted' ? 'Submitted' : 'Submitting'}
                </span>
            ),
        },
    ];

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{
                preserveState: true,
                replace: true,
            }}
        >
            <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
                <Nav stepDetails={stepDetails} activeStep={activeStep} />

                <Content>
                    <div className="mx-auto w-full">
                        <WorkflowTable
                            items={proposals}
                            columns={columns}
                            keyExtractor={(item) => item.slug}
                            votesMap={votesForTable}
                            emptyState={{
                                context: 'proposals',
                                showIcon: true,
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
