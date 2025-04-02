import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import SearchControls from '@/Components/atoms/SearchControls';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import Paginator from '@/Components/Paginator';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { t } from 'i18next';
import { SearchParams } from '../../../../types/search-params';
import { currency } from '@/utils/currency';

import ProposalData = App.DataTransferObjects.ProposalData;
import { PaginatedData } from '../../../../types/paginated-data';
import SearchBar from '@/Components/SearchBar';
import Selector from '@/Components/atoms/Selector';
import ValueLabel from '@/Components/atoms/ValueLabel';
import Value from '@/Components/atoms/Value';
import Button from '@/Components/atoms/Button';

interface Campaign {
    id: number;
    title: string;
    hash: string;
}

interface Step3Props {
    stepDetails: StepDetails[];
    activeStep: number;
    proposals: PaginatedData<ProposalData[]>;
    campaigns: Campaign[];
    selectedProposals: string[];
    filters: SearchParams;
}

// New ProposalCard with the updated design
interface ProposalCardProps {
    proposal: ProposalData;
    isSelected: boolean;
    onSelect: (proposalSlug: string) => void;
    onVote?: (proposalSlug: string, vote: 'yes' | 'abstain') => void;
    currentVote?: string;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, isSelected, onSelect, onVote, currentVote }) => {

    const formatCurrency = (
        amount: number | string | null | undefined,
        currencyCode?: string,
    ): string =>
        currency(
            amount ? parseInt(amount.toString()) : 0,
            2,
            currencyCode || 'USD'
        ) as string;

    const amountRequested = proposal.amount_requested
        ? proposal.amount_requested
        : 0;

    const currencyCode = proposal.currency || 'USD';
    const formattedAmountRequested = formatCurrency(
        amountRequested,
        currencyCode,
    );
    return (
        <div className="flex items-center ml-4 mr-2 p-4 border border-gray-200 rounded-lg shadow-sm mb-4">
            <div
                className={`w-4 h-4 mr-4 flex-shrink-0 rounded border flex items-center justify-center cursor-pointer ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (typeof proposal.slug === 'string') {
                        onSelect(proposal.slug);
                    }
                }}
            >
                {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>

            <div className="max-w-3xl w-full">
                <div className="flex items-center gap-2 mb-2">
                    <Paragraph className="font-bold text-content" size="md">{proposal.title}</Paragraph>
                </div>

                {/* Budget, Fund, Campaign section */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 mb-4">
                    <div className="flex items-center">
                        <ValueLabel className="font-bold text-content">Budget:</ValueLabel>
                        <Paragraph size="sm" className="ml-1 text-success">{formattedAmountRequested}</Paragraph>
                    </div>

                    <div className="flex items-center">
                        <ValueLabel className="font-bold text-content">Fund:</ValueLabel>
                        <Paragraph size="sm" className="ml-1 text-primary">{proposal?.fund?.title}</Paragraph>
                    </div>

                    <div className="flex items-center">
                        <ValueLabel className="font-bold text-content">Campaign:</ValueLabel>
                        <Paragraph size="sm" className="ml-1 text-content">{proposal?.campaign?.title}</Paragraph>
                    </div>
                </div>

                {/* Voting buttons */}
                <div className="flex w-full gap-4 mt-4">
                    <Button
                         className={`flex-1 ${currentVote === 'yes' ? 'bg-success text-white' : 'bg-success-light text-success'} border border-success hover:bg-success hover:text-white py-2 rounded-md font-medium transition`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof proposal.slug === 'string' && onVote) {
                                onVote(proposal.slug, 'yes');
                            }
                        }}
                        ariaLabel="Vote yes"
                    >
                        Yes
                    </Button>
                    <Button
                        className={`flex-1 ${currentVote === 'abstain' ? 'bg-warning text-white' : 'bg-[var(--content-error-light)] text-warning'} border border-warning hover:bg-warning hover:text-white py-2 rounded-md font-medium transition`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof proposal.slug === 'string' && onVote) {
                                onVote(proposal.slug, 'abstain');
                            }
                        }}
                        ariaLabel="Vote abstain"
                    >
                        Abstain
                    </Button>
                </div>
            </div>
        </div>
    );
};

const Step3: React.FC<Step3Props> = ({
    stepDetails,
    activeStep,
    proposals,
    campaigns = [],
    selectedProposals = [],
    filters
}) => {
    // Create a Set for more efficient checking of selected items
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set(selectedProposals || [])
    );
    const [showFilters, setShowFilters] = useState(false);
    // Track votes for proposals
    const [votes, setVotes] = useState<Record<string, string>>({});

    const form = useForm({
        proposals: Array.from(selectedIds) || [],
        votes: votes || {},
    });

    // Update form whenever selection changes
    useEffect(() => {
        form.setData('proposals', Array.from(selectedIds));
        form.setData('votes', votes);
    }, [selectedIds, votes]);

    // Console log proposals when they change
    useEffect(() => {
        console.log('Proposals data:', JSON.stringify(proposals, null, 2));
    }, [proposals]);

    // Log form data whenever it changes
    useEffect(() => {
        console.log('Form data:', {
            proposals: form.data.proposals,
            votes: form.data.votes
        });
    }, [form.data]);

    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
    });

    // Updated toggle function to use proposal.slug instead of proposal.id
    const handleSelectProposal = (proposalSlug: string) => {
        setSelectedIds(prevSelected => {
            // Create a new Set from the previous one
            const newSelected = new Set(prevSelected);

            // Toggle the selection
            if (newSelected.has(proposalSlug)) {
                newSelected.delete(proposalSlug);

                // Also remove any votes for this proposal
                const newVotes = { ...votes };
                delete newVotes[proposalSlug];
                setVotes(newVotes);
            } else {
                newSelected.add(proposalSlug);
            }

            return newSelected;
        });
    };

    // Handle voting for a proposal
    const handleVote = (proposalSlug: string, vote: 'yes' | 'abstain') => {
        // First ensure the proposal is selected
        if (!selectedIds.has(proposalSlug)) {
            setSelectedIds(prev => new Set([...prev, proposalSlug]));
        }

        // Then record the vote
        setVotes(prev => ({
            ...prev,
            [proposalSlug]: vote
        }));
    };

    const submitForm = () => {
        form.post(generateLocalizedRoute('workflows.createVoterList.saveProposals'));
    };



    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{ only: ['proposals'], preserveState: true }}
        >
            <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
                <Nav stepDetails={stepDetails} activeStep={activeStep} />

                <Content>
                    <div className="max-w-3xl mx-auto w-full">
                        <div className="bg-background justify-center items-center sticky top-0 z-10 mb-4 w-full px-4 pt-4">
                            <SearchBar
                                handleSearch={(search) => {
                                    const updatedFilters = {
                                        ...filters,
                                        [ParamsEnum.QUERY]: search,
                                        [ParamsEnum.PAGE]: 1,
                                    };

                                    router.get(window.location.pathname, updatedFilters, {
                                        preserveState: true,
                                        replace: true,
                                    });
                                }}
                                autoFocus
                                showRingOnFocus
                                initialSearch={filters[ParamsEnum.QUERY] || ''}
                                placeholder={t('Search proposals...')}
                            />

                            <div className="mt-4 flex justify-between items-center">
                                {/* Selected count on the left */}
                                <div className="flex items-center flex-wrap gap-2">
                                    <ValueLabel>{t('Selected Proposals:')}</ValueLabel>
                                    <Paragraph size="sm" className="text-gray-persist font-medium shadow px-3 py-1 rounded-md bg-background">{selectedIds.size}/{proposals.total}</Paragraph>
                                </div>

                                {/* Campaign and sort selectors on the right */}
                                <div className="flex gap-2">
                                    <div className="text-sm text-gray-600 mr-2 self-center">
                                        {t('Select campaign:')}
                                    </div>
                                    <Selector
                                        isMultiselect={false}
                                        selectedItems={filters[ParamsEnum.CAMPAIGNS] || ''}
                                        setSelectedItems={(value) => {
                                            const updatedFilters = {
                                                ...filters,
                                                [ParamsEnum.CAMPAIGNS]: value,
                                                [ParamsEnum.PAGE]: 1,
                                            };

                                            router.get(window.location.pathname, updatedFilters, {
                                                preserveState: true,
                                                replace: true,
                                            });
                                        }}
                                        options={campaigns.map(campaign => ({
                                            label: campaign.title,
                                            value: campaign.hash
                                        }))}
                                        hideCheckbox={true}
                                        placeholder={t('All Campaigns')}
                                        className="shadow"
                                    />

                                    <Selector
                                        isMultiselect={false}
                                        selectedItems={filters[ParamsEnum.SORTS] || ''}
                                        setSelectedItems={(value) => {
                                            const updatedFilters = {
                                                ...filters,
                                                [ParamsEnum.SORTS]: value,
                                                [ParamsEnum.PAGE]: 1,
                                            };

                                            router.get(window.location.pathname, updatedFilters, {
                                                preserveState: true,
                                                replace: true,
                                            });
                                        }}
                                        options={ProposalSortingOptions()}
                                        hideCheckbox={true}
                                        placeholder={t('proposals.options.sort')}
                                        className="shadow"
                                    />
                                </div>
                            </div>


                        </div>

                        <div className="w-full">
                            <div className="mt-4 w-full space-y-4 overflow-y-auto">
                                {proposals?.data && proposals.data.length > 0 ? (
                                    proposals.data.map((proposal) => (
                                        <ProposalCard
                                            key={proposal.slug}
                                            proposal={proposal}
                                            isSelected={proposal.slug ? selectedIds.has(proposal.slug) : false}
                                            onSelect={handleSelectProposal}
                                            onVote={handleVote}
                                            currentVote={proposal.slug ? votes[proposal.slug] : undefined}
                                        />
                                    ))
                                ) : (
                                    <div className="text-dark m-4 rounded-lg border border-gray-200 p-4 text-center lg:mt-8">
                                        <Paragraph>
                                            {filters[ParamsEnum.QUERY] ? t('No proposals found matching your search') : t('No proposals available')}
                                        </Paragraph>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
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
                    <PrimaryLink
                        href={prevStep}
                        className="text-sm lg:px-8 lg:py-3"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>{t('Previous')}</span>
                    </PrimaryLink>
                    <PrimaryButton
                        className="text-sm lg:px-8 lg:py-3"
                        disabled={selectedIds.size === 0}
                        onClick={submitForm}
                    >
                        <span>{t('Next')}</span>
                        <ChevronRight className="h-4 w-4" />
                    </PrimaryButton>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step3;