import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Selector from '@/Components/atoms/Selector';
import ValueLabel from '@/Components/atoms/ValueLabel';
import Paginator from '@/Components/Paginator';
import ProposalVotingCard from '@/Components/ProposalVotingCard';
import { FiltersProvider } from '@/Context/FiltersContext';
import { BookMarkCollectionEnum } from '@/enums/bookmark-collection-enums';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { VoteEnum } from '@/enums/votes-enums';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import { StepDetails } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
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
import ProposalSearchBar from './partials/ProposalSearchBar';
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
    selectedProposals: { hash: string; vote: number|null }[];
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
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
        bk: bookmarkHash,
    });

    const [selectedIds, setSelectedIds] =
        useState<{ hash: string; vote: number | null }[]>(
            selectedProposals,
        );

    const form = useForm({
        proposals: selectedIds,
        bookmarkHash,
    });

    useEffect(() => {
        form.setData('proposals', selectedIds);
    }, [selectedIds]);

    const buildUpdatedFilters = (updates: Partial<SearchParams> = {}) => {
        const baseFilters: Record<string, any> = { ...filters };

        if (fundSlug) {
            baseFilters[ParamsEnum.FUNDS] = fundSlug;
        }

        if (bookmarkHash) {
            baseFilters[BookMarkCollectionEnum.BOOKMARK_COLLECTION] =
                bookmarkHash;
        }

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

    const handleVote = (proposalHash: string, vote: number | null) => {

        setSelectedIds((prev) => {
            const existing = prev.find((item) => item.hash === proposalHash);

            if (!existing) {
                return [...prev, { hash: proposalHash, vote }];
            }

            return prev.map((item) =>
                item.hash === proposalHash ? { ...item, vote } : item,
            );
        });

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

        if (fundSlug) {
            updatedFilters[ParamsEnum.FUNDS] = fundSlug;
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
            <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
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

                            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <ValueLabel>
                                        {t(
                                            'workflows.voterList.selectedProposals',
                                        )}
                                    </ValueLabel>
                                    <Paragraph
                                        size="sm"
                                        className="text-gray-persist bg-background rounded-md px-3 py-1 font-medium shadow"
                                    >
                                        {selectedIds.length}/{proposals.total}
                                    </Paragraph>
                                </div>

                                <div className="flex flex-col gap-2 md:flex-row">
                                    <div className="self-start text-sm text-gray-600 md:self-center">
                                        {t(
                                            'workflows.voterList.selectCampaign',
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Selector
                                            isMultiselect={false}
                                            selectedItems={
                                                filters[ParamsEnum.CAMPAIGNS] ||
                                                ''
                                            }
                                            setSelectedItems={(value) =>
                                                handleFilterChange(
                                                    ParamsEnum.CAMPAIGNS,
                                                    value,
                                                )
                                            }
                                            options={campaigns.map(
                                                (campaign) => ({
                                                    label: campaign.title,
                                                    value: campaign.hash,
                                                }),
                                            )}
                                            hideCheckbox={true}
                                            placeholder={t(
                                                'workflows.voterList.allCampaigns',
                                            )}
                                            className="w-full shadow md:w-auto"
                                        />
                                        <Selector
                                            isMultiselect={false}
                                            selectedItems={
                                                filters[ParamsEnum.SORTS] || ''
                                            }
                                            setSelectedItems={(value) =>
                                                handleFilterChange(
                                                    ParamsEnum.SORTS,
                                                    value,
                                                )
                                            }
                                            options={ProposalSortingOptions()}
                                            hideCheckbox={true}
                                            placeholder={t(
                                                'proposals.options.sort',
                                            )}
                                            className="w-full shadow md:w-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full">
                            <div className="mt-4 mb-4 max-h-[25rem] w-full space-y-4 overflow-y-auto">
                                {proposals?.data &&
                                proposals.data.filter((p) => p.hash).length >
                                    0 ? (
                                    proposals.data
                                        .filter((p) => p.hash)
                                        .map((proposal) => {
                                            let selected = selectedIds.find(
                                                (item) =>
                                                    item.hash == proposal.hash,
                                            );

                                            return (
                                                <ProposalVotingCard
                                                    key={proposal.hash}
                                                    proposal={proposal}
                                                    isSelected={
                                                        !!selected &&
                                                        (selected.vote ==
                                                            VoteEnum.ABSTAIN ||
                                                            selected.vote ==
                                                                VoteEnum.YES)
                                                    }
                                                    onVote={(proposal, hash) =>
                                                        handleVote(
                                                            proposal,
                                                            hash,
                                                        )
                                                    }
                                                    currentVote={selected?.vote}
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
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step3;
