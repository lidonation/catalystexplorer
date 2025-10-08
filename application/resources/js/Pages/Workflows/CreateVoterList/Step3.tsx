import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Paginator from '@/Components/Paginator';
import ProposalVotingCard from '@/Components/ProposalVotingCard';
import { FiltersProvider } from '@/Context/FiltersContext';
import { BookMarkCollectionEnum } from '@/enums/bookmark-collection-enums';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { VoteEnum } from '@/enums/votes-enums';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { StepDetails } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { Link, router, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import ProposalSearchBar from './partials/ProposalSearchBar';
import VoterListFilters from './partials/VoterListFilters';
import ProposalData = App.DataTransferObjects.ProposalData;

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
    selectedProposals: { id: string; vote: number | null }[];
    filters: SearchParams;
    bookmarkHash: string;
    fundSlug?: string;
}

const Step3: React.FC<Step3Props> = ({
    stepDetails,
    activeStep,
    proposals,
    campaigns = [],
    selectedProposals = [],
    filters,
    bookmarkHash,
    fundSlug,
}) => {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
        bk: bookmarkHash,
    });

    const [selectedIds, setSelectedIds] =
        useState<{ id: string; vote: number | null }[]>(selectedProposals);

    const form = useForm({
        proposals: selectedIds,
        bookmarkHash,
    });

    useEffect(() => {
        form.setData('proposals', selectedIds);
    }, [selectedIds]);

    const handleVote = (proposalId: string, vote: number | null) => {
        setSelectedIds((prev) => {
            const existing = prev.find((item) => item.id === proposalId);

            if (!existing) {
                return [...prev, { id: proposalId, vote }];
            }

            return prev.map((item) =>
                item.id === proposalId ? { ...item, vote } : item,
            );
        });
    };

    const handleRemoveBookmark = async (proposalId: string) => {
        if (!bookmarkHash) return;

        try {
            const response = await fetch(
                generateLocalizedRoute('workflows.createVoterList.removeBookmarkItem', {
                    bookmarkCollection: bookmarkHash,
                }),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        modelType: 'proposals',
                        hash: proposalId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove bookmark item');
            }

            // Remove from selected proposals list
            setSelectedIds((prev) => 
                prev.filter((item) => item.id !== proposalId)
            );
            
            // Reload the page to refresh the proposal list
            router.reload({ only: ['proposals', 'selectedProposals'] });
            
        } catch (error) {
            console.error('Error removing bookmark item:', error);
            // You might want to show a toast notification here
        }
    };

    const handleSearch = (search: string) => {
        const updatedFilters: Record<
            string,
            string | number | string[] | number[]
        > = {
            ...filters,
        };

        if (search) {
            updatedFilters[ParamsEnum.QUERY] = search;
            updatedFilters[ParamsEnum.PAGE] = 1;
        } else {
            delete updatedFilters[ParamsEnum.QUERY];
            delete updatedFilters[ParamsEnum.PAGE];
        }

        // Preserve the fund filter (use existing fund filter or fundSlug)
        const existingFundFilter = filters[ParamsEnum.FUNDS];
        if (existingFundFilter || fundSlug) {
            updatedFilters[ParamsEnum.FUNDS] = existingFundFilter || fundSlug!;
        }

        if (bookmarkHash) {
            updatedFilters[BookMarkCollectionEnum.BOOKMARK_COLLECTION] =
                bookmarkHash;
        }

        router.get(window.location.pathname, updatedFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const submitForm = () => {
        form.post(
            generateLocalizedRoute('workflows.createVoterList.saveProposals'),
        );
    };

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{
                preserveState: true,
                replace: true,
            }}
        >
            <WorkflowLayout
                title="Create Voter List"
                asideInfo={stepDetails[activeStep - 1].info ?? ''}
                disclaimer={t('workflows.voterList.prototype')}
            >
                <Nav stepDetails={stepDetails} activeStep={activeStep} />

                <Content>
                    <div className="mx-auto w-full max-w-3xl">
                        <div className="bg-background top-0 z-10 mb-4 w-full items-center justify-center px-4 pt-4">
                            <ProposalSearchBar
                                handleSearch={handleSearch}
                                autoFocus
                                showRingOnFocus
                                initialSearch={filters[ParamsEnum.QUERY] || ''}
                            />

                            <div className="mt-4 flex w-full items-end justify-end">
                                <VoterListFilters
                                    campaigns={campaigns}
                                    filters={filters}
                                    bookmarkHash={bookmarkHash}
                                    fundSlug={fundSlug}
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <div className="mt-4 mb-4 max-h-[25rem] w-full space-y-4 overflow-y-auto">
                                {proposals?.data &&
                                proposals.data.filter((p) => p.id).length >
                                    0 ? (
                                    proposals.data
                                        .filter((p) => p.id)
                                        .map((proposal) => {
                                            const selected = selectedIds.find(
                                                (item) =>
                                                    item.id == proposal.id,
                                            );

                                            const isFromBookmarkCollection = selectedProposals.some(
                                                (sp) => sp.id === proposal.id
                                            );
                                            
                                            return (
                                                <ProposalVotingCard
                                                    key={proposal.id}
                                                    proposal={proposal}
                                                    isSelected={
                                                        !!selected &&
                                                        (selected.vote ==
                                                            VoteEnum.ABSTAIN ||
                                                            selected.vote ==
                                                                VoteEnum.YES)
                                                    }
                                                    onVote={(hash, vote) =>
                                                        handleVote(hash, vote)
                                                    }
                                                    currentVote={selected?.vote}
                                                    onRemove={handleRemoveBookmark}
                                                    showRemoveButton={isFromBookmarkCollection && !!bookmarkHash}
                                                />
                                            );
                                        })
                                ) : (
                                    <RecordsNotFound showIcon={true} />
                                )}
                            </div>

                            {proposals &&
                                proposals.data &&
                                proposals.data.length > 0 && (
                                    <div className="mb-8">
                                        <Paginator
                                            pagination={proposals}
                                            linkProps={{
                                                preserveState: true,
                                                preserveScroll: false,
                                            }}
                                        />
                                    </div>
                                )}
                        </div>
                    </div>
                </Content>

                <Footer>
                    {bookmarkHash && (
                        <Link
                            href={localizedRoute('my.lists.index')}
                            className="text-sm lg:px-8 lg:py-3"
                        >
                            {t('Close')}
                        </Link>
                    )}
                    <div className="flex gap-2">
                        <PrimaryLink
                            href={prevStep}
                            className="text-sm lg:px-8 lg:py-3"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span>{t('Previous')}</span>
                        </PrimaryLink>
                        <PrimaryButton
                            className="text-sm lg:px-8 lg:py-3"
                            disabled={!selectedIds.length}
                            onClick={submitForm}
                        >
                            <span>{t('Next')}</span>
                            <ChevronRight className="h-4 w-4" />
                        </PrimaryButton>
                    </div>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step3;
