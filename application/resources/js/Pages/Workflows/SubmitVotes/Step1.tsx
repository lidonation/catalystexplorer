import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';

import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import WorkflowLayout from '../WorkflowLayout';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import ProposalVotingCard from '@/Components/ProposalVotingCard';
import ProposalSearchBar from '../CreateVoterList/partials/ProposalSearchBar';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';

import { VoteEnum } from '@/enums/votes-enums';
import { StepDetails } from '@/types';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { SearchParams } from '../../../../types/search-params';
import { PaginatedData } from '../../../../types/paginated-data';
import ProposalData = App.DataTransferObjects.ProposalData;

interface Step1Props {
    stepDetails: StepDetails[];
    activeStep: number;
    proposals: PaginatedData<ProposalData[]>;
    selectedProposals?: string[];
    votes?: Record<string, VoteEnum>;
    filters: SearchParams;
}

const Step1: React.FC<Step1Props> = ({
                                         stepDetails,
                                         activeStep,
                                         proposals,
                                         selectedProposals: initialSelectedProposals = [],
                                         votes: initialVotes = {},
                                         filters
                                     }) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const nextStep = localizedRoute('workflows.voting.index', {
        step: activeStep + 1,
    });

    const [selectedProposals, setSelectedProposals] = useState<Set<string>>(
        new Set(initialSelectedProposals)
    );
    const [votesState, setVotes] = useState<Record<string, VoteEnum>>(initialVotes);

    const form = useForm({
        proposals: Array.from(selectedProposals),
        votes: votesState,
        proposalData: proposals.data
            .filter(p => p.slug && selectedProposals.has(p.slug))
            .map(p => ({
                slug: p.slug || '',
                title: p.title || '',
                fund: {
                    title: p.fund?.title || 'Unknown Fund'
                },
                requested_funds: p.amount_requested || '75K ADA',
                vote: votesState[p.slug || ''] || null,
                exists: true
            }))
    });

    useEffect(() => {
        form.setData('proposals', Array.from(selectedProposals));
        form.setData('votes', votesState);
        proposalData: proposals.data.filter(p => selectedProposals.has(p.slug || ''))
    }, [selectedProposals, votesState]);

    const handleSelectProposal = (proposalSlug: string) => {
        if (!proposalSlug) {
            console.error("Attempted to select proposal with empty slug");
            return;
        }
        setSelectedProposals(prevSelected => {
            const newSelected = new Set(prevSelected);

            if (newSelected.has(proposalSlug)) {
                newSelected.delete(proposalSlug);

                setVotes(prev => {
                    const newVotes = { ...prev };
                    delete newVotes[proposalSlug];
                    return newVotes;
                });
            } else {
                newSelected.add(proposalSlug);
            }

            return newSelected;
        });
    };

    const handleVote = (proposalSlug: string, vote: VoteEnum) => {
        if (!selectedProposals.has(proposalSlug)) {
            setSelectedProposals(prev => new Set([...prev, proposalSlug]));
        }

        setVotes(prev => ({
            ...prev,
            [proposalSlug]: vote
        }));
    };

    const handleSearch = (search: string) => {
        const updatedFilters: Record<string, string | number | string[] | number[]> = {
            ...filters,
        };

        if (search) {
            updatedFilters[ParamsEnum.QUERY] = search;
            updatedFilters[ParamsEnum.PAGE] = 1;
        } else {
            delete updatedFilters[ParamsEnum.QUERY];
            delete updatedFilters[ParamsEnum.PAGE];
        }

        router.get(
            window.location.pathname,
            updatedFilters,
            { preserveState: true, replace: true }
        );
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

        if (Object.keys(updates).length > 0 &&
            !updates[ParamsEnum.PAGE] &&
            baseFilters[ParamsEnum.PAGE]
        ) {
            baseFilters[ParamsEnum.PAGE] = 1;
        }

        return baseFilters;
    };

    const handleFilterChange = (paramName: string, value: string | number | string[] | number[]) => {
        router.get(
            window.location.pathname,
            buildUpdatedFilters({ [paramName]: value }),
            { preserveState: true, replace: true }
        );
    };

    const handleNext = () => {
        form.post(generateLocalizedRoute('workflows.voting.saveDecisions'), {
            onSuccess: () => {
                router.visit(nextStep);
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            }
        });
    };

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
                    <div className="max-w-3xl mx-auto w-full">
                        <div className="bg-background justify-center items-center top-0 z-10 mb-4 w-full px-4 pt-4">
                            <ProposalSearchBar
                                handleSearch={handleSearch}
                                autoFocus
                                showRingOnFocus
                                initialSearch={filters[ParamsEnum.QUERY] || ''}
                            />

                            <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="flex items-center flex-wrap gap-2">
                                    <Paragraph size="sm" className="text-gray-persist font-medium shadow px-3 py-1 rounded-md bg-background">
                                        {t('workflows.voting.steps.votesSubmitted')} {selectedProposals.size}/{proposals.total}
                                    </Paragraph>
                                </div>
                            </div>
                        </div>

                        <div className="w-full">
                            <div className="mt-4 w-full space-y-4 overflow-y-auto">
                                {proposals?.data && proposals.data.filter(p => p.slug).length > 0 ? (
                                    proposals.data.filter(p => p.slug).map((proposal) => (
                                        <ProposalVotingCard
                                            key={proposal.slug}
                                            proposal={proposal}
                                            isSelected={proposal.slug ? selectedProposals.has(proposal.slug) : false}
                                            onSelect={handleSelectProposal}
                                            onVote={handleVote}
                                            currentVote={proposal.slug ? votesState[proposal.slug] : undefined}
                                        />
                                    ))
                                ) : (
                                    <RecordsNotFound
                                        showIcon={true}
                                    />
                                )}
                            </div>

                            {proposals && proposals.data && proposals.data.length > 0 && (
                                <div className="mt-6">
                                    <Paginator
                                        pagination={proposals}
                                        linkProps={{
                                            preserveState: true,
                                            preserveScroll: true,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Content>

                <Footer>
                    <div></div>
                    <PrimaryLink
                        href={nextStep}
                        className="text-sm lg:px-8 lg:py-3"
                        onClick={(e) => {
                            if (selectedProposals.size === 0) {
                                e.preventDefault();
                            } else {
                                e.preventDefault();
                                handleNext();
                            }
                        }}
                        disabled={selectedProposals.size === 0}
                    >
                        <span>{t('Next')}</span>
                        <ChevronRight className="h-4 w-4" />
                    </PrimaryLink>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step1;
