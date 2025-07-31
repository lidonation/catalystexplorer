import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import { VoteEnum } from '@/enums/votes-enums';
import { StepDetails } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import WorkflowTable from './WorkflowTable';
import BookmarkItemData = App.DataTransferObjects.BookmarkItemData;
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface Step9Props {
    stepDetails: StepDetails[];
    activeStep: number;
    selectedProposals: PaginatedData<BookmarkItemData[]>;
    votes: Record<string, VoteEnum>;
    filters: SearchParams;
    bookmarkCollection: BookmarkCollectionData;
}

const Step9: React.FC<Step9Props> = ({
    stepDetails,
    activeStep,
    selectedProposals,
    votes = {},
    filters,
    bookmarkCollection,
}) => {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
        bk: bookmarkCollection.hash,
    });
    const nextStep = localizedRoute('workflows.createVoterList.success', {});

    type ExtendedProposalData = ProposalData & {
        vote: number | null;
        exists: boolean;
    };

    const proposalData = selectedProposals.data.map((item) => {
        let model = item.model as ProposalData;
        return {
            hash: model.slug,
            title: model.title,
            fund: bookmarkCollection.fund,
            amount_requested: model.amount_requested,
            vote: item?.vote,
            exists: true,
        } as ExtendedProposalData;
    });

    const defaultVoteRender = (item: ExtendedProposalData): React.ReactNode => {
        const voteType = item?.vote;

        switch (voteType) {
            case VoteEnum.YES:
                return (
                    <span
                        className={`inline-flex rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white`}
                    >
                        {'Yes'}
                    </span>
                );
            case VoteEnum.NO:
                return (
                    <span
                        className={`bg-danger-strong inline-flex rounded-md px-4 py-2 text-sm font-medium text-white`}
                    >
                        {'No'}
                    </span>
                );
            case VoteEnum.ABSTAIN:
                return (
                    <span
                        className={`inline-flex rounded-md bg-orange-400 px-4 py-2 text-sm font-medium text-white`}
                    >
                        {'ABSTAIN'}
                    </span>
                );
            default:
                return (
                    <span
                        className={`inline-flex rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 text-white`}
                    >
                        {'Unknown'}
                    </span>
                );
        }
    };

    const columns = [
        {
            key: 'index',
            header: 'No.',
            render: (item: ExtendedProposalData, index: number) =>
                index + 1 + (selectedProposals.current_page - 1) * selectedProposals.per_page,
        },
        {
            key: 'fund.title',
            header: 'Fund',
            render: (item: ExtendedProposalData, index: number) =>
                item.fund?.title || '-',
        },
        {
            key: 'title',
            header: 'Proposal',
            render: (item: ExtendedProposalData, index: number) =>
                item?.title || '-',
        },
        {
            key: 'budget',
            header: 'Budget',
            render: (item: ExtendedProposalData, index: number) => {
                const amountRequested = item.amount_requested || 0;
                return currency(amountRequested, 2, item.fund?.currency);
            },
        },
        {
            key: 'vote',
            header: 'Vote',
            render: (item: ExtendedProposalData) => defaultVoteRender(item),
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

                <Content>
                    <div className="bg-background overflow-x-auto rounded-lg">
                        <div className="mx-auto">
                            <WorkflowTable<ExtendedProposalData>
                                items={proposalData}
                                columns={columns}
                                votesMap={votes}
                                emptyState={{
                                    context: 'proposals',
                                    showIcon: true,
                                }}
                            />
                        </div>
                    </div>
                    <div className="px-4">
                        <Paginator
                            pagination={selectedProposals}
                            linkProps={{
                                preserveState: true,
                                preserveScroll: true,
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
                        disabled={selectedProposals.total === 0}
                    >
                        <span>{t('Next')}</span>
                        <ChevronRight className="h-4 w-4" />
                    </PrimaryLink>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step9;
