import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { VoteEnum } from '@/enums/votes-enums';
import { StepDetails } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { currency } from '@/utils/currency';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import WorkflowTable from './WorkflowTable';

interface ProposalType {
    slug: string;
    title: string;
    fund?: {
        title: string;
    };
    requested_funds?: string;
    vote?: VoteEnum;
}

interface Step2Props {
    stepDetails: StepDetails[];
    activeStep: number;
    selectedProposals: PaginatedData<ProposalType[]>;
    votes: Record<string, VoteEnum>;
    filters: SearchParams;
}

const Step2: React.FC<Step2Props> = ({
    stepDetails,
    activeStep,
    selectedProposals,
    votes = {},
    filters,
}) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.voting.index', {
        step: activeStep - 1,
    });
    const nextStep = localizedRoute('workflows.voting.index', {
        step: activeStep + 1,
    });

    const [formErrors, setFormErrors] = useState<string[]>([]);
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

    const form = useForm({
        proposals: selectedProposals.data.map((p) => p.slug),
        votes,
        proposalData: selectedProposals.data.map((p) => ({
            slug: p.slug,
            title: p.title,
            fund: p.fund,
            requested_funds: p.requested_funds,
            vote: votes[p.slug] || null,
            exists: true,
        })),
    });

    useEffect(() => {
        const errors: string[] = [];

        setFormErrors(errors);
    }, [selectedProposals, votes]);

    const handleNext = () => {
        if (formErrors.length > 0) {
            console.error('Form validation errors:', formErrors);
            return;
        }
        form.setData(
            'proposals',
            selectedProposals.data.map((p) => p.slug),
        );
        form.setData('votes', votes);
        form.setData(
            'proposalData',
            selectedProposals.data.map((p) => ({
                slug: p.slug,
                title: p.title,
                fund: p.fund,
                requested_funds: p.requested_funds,
                vote: votes[p.slug] || null,
                exists: true as const,
            })),
        );
        form.post(generateLocalizedRoute('workflows.voting.saveDecisions'), {
            onSuccess: () => {
                router.visit(nextStep);
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
                const serverErrors = Object.values(errors).flat();
                setFormErrors(serverErrors);
            },
        });
    };

    const buildUpdatedFilters = (updates: Partial<SearchParams> = {}) => {
        const baseFilters: Record<string, any> = { ...filters };

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                delete baseFilters[key];
            } else {
                baseFilters[key] = value;
            }
        });

        if (
            Object.keys(updates).length > 0 &&
            !updates[ParamsEnum.PAGE] &&
            baseFilters[ParamsEnum.PAGE]
        ) {
            baseFilters[ParamsEnum.PAGE] = 1;
        }

        return baseFilters;
    };

    const handleFilterChange = (
        paramName: string,
        value: string | number | string[] | number[],
    ) => {
        router.get(
            window.location.pathname,
            buildUpdatedFilters({ [paramName]: value }),
            { preserveState: true, replace: true },
        );
    };

    const columns = [
        {
            key: 'index',
            header: 'No.',
            render: (_: ProposalType, index: number) => index + 1,
        },
        {
            key: 'fund.title',
            header: 'Fund',
            render: (item: ProposalType) => item.fund?.title || '-',
        },
        {
            key: 'title',
            header: 'Proposal',
        },
        {
            key: 'budget',
            header: 'Budget',
            render: (item: ProposalType) => {
                const amountRequested = item.requested_funds || '0';
                const currencyCode = 'ADA';

                return formatCurrency(amountRequested, currencyCode);
            },
        },
        {
            key: 'vote',
            header: 'Vote',
        },
    ];

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{
                preserveState: true,
                preserveScroll: false,
                replace: true,
            }}
        >
            <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
                <Nav stepDetails={stepDetails} activeStep={activeStep} />

                {/* Error handling */}
                {formErrors.length > 0 && (
                    <div className="mx-auto mb-4 w-full max-w-3xl">
                        <div
                            className="relative rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                            role="alert"
                        >
                            <ul className="text-content list-inside list-disc">
                                {formErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <Content>
                    <div className="mx-auto w-full">
                        <WorkflowTable<ProposalType>
                            items={selectedProposals}
                            columns={columns}
                            keyExtractor={(item) => item.slug}
                            votesMap={votes}
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
                    <PrimaryLink
                        href={nextStep}
                        className="text-sm lg:px-8 lg:py-3"
                        onClick={(e) => {
                            e.preventDefault();
                            handleNext();
                        }}
                        disabled={
                            selectedProposals.total === 0 ||
                            formErrors.length > 0
                        }
                    >
                        <span>{t('Next')}</span>
                        <ChevronRight className="h-4 w-4" />
                    </PrimaryLink>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step2;
