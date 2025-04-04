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
import { useTranslation } from 'react-i18next';
import { SearchParams } from '../../../../types/search-params';
import { currency } from '@/utils/currency';
import ProposalData = App.DataTransferObjects.ProposalData;
import { PaginatedData } from '../../../../types/paginated-data';
import SearchBar from '@/Components/SearchBar';
import Selector from '@/Components/atoms/Selector';
import ValueLabel from '@/Components/atoms/ValueLabel';
import Value from '@/Components/atoms/Value';
import Button from '@/Components/atoms/Button';
import { VoteEnum } from '@/enums/votes-enums';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ProposalCard from '@/Pages/Proposals/Partials/ProposalCard';
import ProposalVotingCard from '@/Components/ProposalVotingCard';

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

interface ProposalCardProps {
    proposal: ProposalData;
    isSelected: boolean;
    onSelect: (proposalSlug: string) => void;
    onVote?: (proposalSlug: string, vote: VoteEnum) => void;
    currentVote?: VoteEnum;
}

const Step3: React.FC<Step3Props> = ({
    stepDetails,
    activeStep,
    proposals,
    campaigns = [],
    selectedProposals = [],
    filters
}) => {

    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set(selectedProposals || [])
    );

    const [votes, setVotes] = useState<Record<string, VoteEnum>>({});

    const form = useForm({
        proposals: Array.from(selectedIds) || [],
        votes: votes || {},
    });

    const { t } = useTranslation();

    useEffect(() => {
        form.setData('proposals', Array.from(selectedIds));
        form.setData('votes', votes);
    }, [selectedIds, votes]);

    useEffect(() => {
        console.log('Proposals data:', JSON.stringify(proposals, null, 2));
    }, [proposals]);

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

    const handleSelectProposal = (proposalSlug: string) => {
        setSelectedIds(prevSelected => {

            const newSelected = new Set(prevSelected);

            if (newSelected.has(proposalSlug)) {
                newSelected.delete(proposalSlug);

                const newVotes = { ...votes };
                delete newVotes[proposalSlug];
                setVotes(newVotes);
            } else {
                newSelected.add(proposalSlug);
            }

            return newSelected;
        });
    };

    const handleVote = (proposalSlug: string, vote: VoteEnum) => {

        if (!selectedIds.has(proposalSlug)) {
            setSelectedIds(prev => new Set([...prev, proposalSlug]));
        }

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
                        <div className="bg-background justify-center items-center top-0 z-10 mb-4 w-full px-4 pt-4">
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
                                placeholder={t('workflows.voterList.searchProposals')}
                            />

                            <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="flex items-center flex-wrap gap-2">
                                    <ValueLabel>{t('workflows.voterList.selectedProposals')}</ValueLabel>
                                    <Paragraph size="sm" className="text-gray-persist font-medium shadow px-3 py-1 rounded-md bg-background">
                                        {selectedIds.size}/{proposals.total}
                                    </Paragraph>
                                </div>

                                <div className="flex flex-col md:flex-row gap-2">
                                    <div className="text-sm text-gray-600 self-start md:self-center">
                                        {t('workflows.voterList.selectCampaign')}
                                    </div>
                                    <div className="flex gap-2">
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
                                            placeholder={t('workflows.voterList.allCampaigns')}
                                            className="shadow w-full md:w-auto"
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
                                            className="shadow w-full md:w-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full">
                            <div className="mt-4 w-full space-y-4 overflow-y-auto">
                                {proposals?.data && proposals.data.length > 0 ? (
                                    proposals.data.map((proposal) => (
                                        <ProposalVotingCard
                                            key={proposal.slug}
                                            proposal={proposal}
                                            isSelected={proposal.slug ? selectedIds.has(proposal.slug) : false}
                                            onSelect={handleSelectProposal}
                                            onVote={handleVote}
                                            currentVote={proposal.slug ? votes[proposal.slug] : undefined}
                                        />
                                    ))
                                ) : (
                                    <RecordsNotFound
                                        context="proposals"
                                        searchTerm={filters[ParamsEnum.QUERY]}
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