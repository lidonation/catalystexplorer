import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import ManageProposalButton from '@/Pages/My/Proposals/partials/ManageProposalButton';
import ProposalCardHeader from '@/Pages/Proposals/Partials/ProposalCardHeader';
import ProposalFundingPercentages from '@/Pages/Proposals/Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import CompareButton from './CompareButton';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import React, { useCallback, useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import YesVoteIcon from '@/Components/svgs/YesVoteIcon';
import AbstainVoteIcon from '@/Components/svgs/AbstainVoteIcon';
import TableHeaderCell from './ProposalTableHeaderCell';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { shortNumber } from '@/utils/shortNumber';
import Paginator from '@/Components/Paginator';
import { PaginatedData } from '@/types/paginated-data';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProposalData = App.DataTransferObjects.ProposalData;
import Paragraph from '@/Components/atoms/Paragraph';
import { Button } from '@headlessui/react';

interface ColumnConfig {
    key: string;
    label: string | React.ReactNode;
    sortable?: boolean;
    sortKey?: string;
    renderCell: (
        proposal: ProposalData,
        helpers: TableHelpers
    ) => React.ReactNode;
}

interface TableHelpers {
    selectedUser: IdeascaleProfileData | null;
    handleUserClick: (user: IdeascaleProfileData) => void;
    noSelectedUser: () => void;
}

type ActionType = 'manage' | 'view';

interface ColumnVisibility {
    title?: boolean;
    proposal?: boolean;
    fund?: boolean;
    status?: boolean;
    funding?: boolean;
    teams?: boolean;
    yesVotes?: boolean;
    abstainVotes?: boolean;
    action?: boolean;
    viewProposal?: boolean;
}

interface ProposalTableProps {
    proposals: PaginatedData<ProposalData[]>;
    columnVisibility?: ColumnVisibility;
    actionType?: ActionType; // Controls which action column to show
    disableSorting?: boolean; // If true, all columns become unsortable
}

const ProposalTable: React.FC<ProposalTableProps> = ({
                                                         proposals,
                                                         columnVisibility = {},
                                                         actionType = 'manage', // Default to 'manage' for backward compatibility
                                                         disableSorting = false // Default to false to maintain existing behavior
                                                     }) => {
    const { t } = useLaravelReactI18n();
    const { setFilters, getFilter } = useFilterContext();
    const [selectedUserMap, setSelectedUserMap] = useState<
        Record<string, IdeascaleProfileData | null>
    >({});

    // Merge with default visibility (all columns visible by default)
    const defaultVisibility: ColumnVisibility = {
        title: false, // Hidden by default
        proposal: true,
        fund: false, // Hidden by default
        status: true,
        funding: true,
        teams: true,
        yesVotes: false,
        abstainVotes: false,
        action: actionType === 'manage',
        viewProposal: actionType === 'view'
    };

    const mergedVisibility = { ...defaultVisibility, ...columnVisibility };

    const currentSort = getFilter(ParamsEnum.SORTS) || null;
    const [sortField, sortDirection] = currentSort ? currentSort.split(':') : [null, null];

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';

        if (sortField === key) {
            if (sortDirection === 'asc') {
                direction = 'desc';
            } else if (sortDirection === 'desc') {
                direction = null;
            } else {
                direction = 'asc';
            }
        }

        if (!direction) {
            const url = new URL(window.location.href);

            url.searchParams.delete(ParamsEnum.SORTS);

            router.get(url.pathname + url.search, {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });

            setFilters({
                param: ParamsEnum.SORTS,
                value: null,
                label: 'Sort'
            });
        } else {
            setFilters({
                param: ParamsEnum.SORTS,
                value: `${key}:${direction}`,
                label: 'Sort'
            });
        }
    };

    const columns: ColumnConfig[] = [
        {
            key: 'title',
            label: t('proposalComparison.tableHeaders.title'),
            sortable: !disableSorting,
            sortKey: 'title',
            renderCell: (proposal: ProposalData) => (
                <div className="w-80" data-testid={`proposal-title-${proposal.id}`}>
                    <Paragraph className="text-md text-content" data-testid={`proposal-title-text-${proposal.id}`}>
                        <Link
                            href={proposal.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                            data-testid={`view-proposal-button-${proposal.id}`}
                        >
                            {proposal.title}
                        </Link>
                    </Paragraph>
                </div>
            )
        },
        {
            key: 'proposal',
            label: t('proposal'),
            sortable: !disableSorting,
            sortKey: 'title',
            renderCell: (proposal: ProposalData, { selectedUser, noSelectedUser }: TableHelpers) => (
                <div className="w-80" data-testid={`proposal-card-header-${proposal.id}`}>
                    <ProposalCardHeader
                        proposal={proposal}
                        userSelected={selectedUser}
                        noSelectedUser={noSelectedUser}
                        isHorizontal={false}
                        data-testid={`proposal-card-${proposal.id}`}
                    />
                </div>
            ),
        },
        {
            key: 'action',
            label: t('proposals.action'),
            renderCell: (proposal: ProposalData) => (
                <div data-testid={`proposal-action-${proposal.id}`}>
                    <ManageProposalButton
                        proposal={proposal}
                        data-testid={`manage-proposal-button-${proposal.id}`}
                    />
                </div>
            ),
        },
        {
            key: 'viewProposal',
            label: t('proposals.action'),
            renderCell: (proposal: ProposalData) => (
                <div className='flex items-center gap-3 w-20' data-testid={`proposal-view-${proposal.id}`}>
                    <CompareButton
                        model="proposal"
                        hash={proposal.id ?? ''}
                        tooltipDescription="Compare Proposals"
                        data={proposal}
                        data-testid={`compare-button`}
                    />
                    <BookmarkButton
                        modelType="proposals"
                        itemId={proposal.id ?? ''}
                        data-testid="bookmark-button"
                    />
                </div>
            ),
        },
        {
            key: 'fund',
            label: t('proposalComparison.tableHeaders.fund'),
            sortable: !disableSorting,
            sortKey: 'fund_id',
            renderCell: (proposal: ProposalData) => (
                <div
                    className="flex items-center justify-center border border-light-gray-persist bg-light-gray-persist/[10%] px-1  rounded-md"
                    data-testid={`proposal-fund-${proposal.id}`}>
                    {proposal.fund?.label && (
                        <span className="items-center py-1 rounded-full text-xs font-medium text-content text-nowrap"
                              data-testid={`proposal-fund-label-${proposal.id}`}>
                            {proposal.fund.label}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            label: t('proposalComparison.tableHeaders.status'),
            sortable: !disableSorting,
            sortKey: 'funding_status',
            renderCell: (proposal: ProposalData) => (
                <div className="flex w-32 items-center justify-center" data-testid={`proposal-status-${proposal.id}`}>
                    <ProposalFundingStatus
                        funding_status={proposal.funding_status ?? ''}
                        data-testid={`proposal-funding-status-${proposal.id}`}
                    />
                </div>
            )
        },
        {
            key: 'funding',
            label: t('funding'),
            sortable: !disableSorting,
            sortKey: 'amount_received',
            renderCell: (proposal: ProposalData) => (
                <div className="flex w-60" data-testid={`proposal-funding-${proposal.id}`}>
                    <ProposalFundingPercentages
                        proposal={proposal}
                        data-testid={`proposal-funding-percentages-${proposal.id}`}
                    />
                </div>
            )
        },
        {
            key: 'teams',
            label: t('teams'),
            sortable: false, // Keep this always false as it was originally
            sortKey: 'users.proposals_completed',
            renderCell: (proposal: ProposalData, { handleUserClick }: TableHelpers) => (
                <div className="w-40" data-testid={`proposal-teams-${proposal.id}`}>
                    <IdeascaleProfileUsers
                        users={proposal.users}
                        onUserClick={handleUserClick}
                        className="bg-content-light"
                        toolTipProps={t('proposals.viewTeam')}
                        data-testid={`proposal-ideascale-users-${proposal.id}`}
                    />
                </div>
            )
        },
        {
            key: 'yesVotes',
            label: (
                <div className="flex items-center gap-2" data-testid="yes-votes-header">
                    <YesVoteIcon
                        className="size-5 font-medium text-success"
                        width={20}
                        height={20}
                        data-testid="yes-vote-icon"
                    />
                    <span className="flex gap-2 text-content/60" data-testid="yes-votes-label">
                        <Paragraph size="sm">{t('yesVotes')}</Paragraph>
                    </span>
                </div>
            ),
            sortable: !disableSorting,
            sortKey: 'yes_votes_count',
            renderCell: (proposal: ProposalData) => (
                <div className="text-center" data-testid={`proposal-yes-votes-${proposal.id}`}>
                    <div className="flex items-center justify-center gap-2"
                         data-testid={`proposal-yes-votes-content-${proposal.id}`}>
                        <Paragraph className="text-light-gray-persist"
                                   data-testid={`proposal-yes-votes-count-${proposal.id}`}>({shortNumber(proposal.yes_votes_count) || '0'})</Paragraph>
                    </div>
                </div>
            )
        },
        {
            key: 'abstainVotes',
            label: (
                <div className="flex items-center gap-2" data-testid="abstain-votes-header">
                    <AbstainVoteIcon
                        className="size-4 font-medium"
                        width={16}
                        height={16}
                        data-testid="abstain-vote-icon"
                    />
                    <div className="flex gap-2 text-content/60" data-testid="abstain-votes-label">
                        <Paragraph size="sm">{t('abstainVotes')}</Paragraph>
                    </div>
                </div>
            ),
            sortable: !disableSorting,
            sortKey: 'abstain_votes_count',
            renderCell: (proposal: ProposalData) => (
                <div className="text-center" data-testid={`proposal-abstain-votes-${proposal.id}`}>
                    <div className="flex items-center justify-center gap-2"
                         data-testid={`proposal-abstain-votes-content-${proposal.id}`}>
                        <Paragraph className="text-light-gray-persist"
                                   data-testid={`proposal-abstain-votes-count-${proposal.id}`}>({shortNumber(proposal.abstain_votes_count) || '0'})</Paragraph>
                    </div>
                </div>
            )
        },
    ].filter(column => mergedVisibility[column.key as keyof ColumnVisibility] !== false);

    const getRowHelpers = useCallback(
        (proposalHash: string): TableHelpers => {
            return {
                selectedUser: selectedUserMap[proposalHash] ?? null,
                handleUserClick: (user: IdeascaleProfileData) => {
                    setSelectedUserMap((prev) => ({
                        ...prev,
                        [proposalHash]: user
                    }));
                },
                noSelectedUser: () => {
                    setSelectedUserMap((prev) => ({
                        ...prev,
                        [proposalHash]: null
                    }));
                }
            };
        },
        [selectedUserMap]
    );

    return (
        <div className="mb-8 rounded-lg border-2 border-gray-200 bg-background shadow-md">
            <div className="overflow-x-auto">
                <table className="w-max min-w-full">
                    <thead className="border-gray-200 whitespace-nowrap bg-background-lighter"
                           data-testid="proposal-table-header">
                    <tr data-testid="proposal-table-header-row">
                        {columns.map(column => (
                            <th
                                key={column.key}
                                className="border-gray-200 border-b border-r px-4 py-3 text-left font-medium text-content last:border-r-0"
                                data-testid={`proposal-table-header-${column.key}`}
                            >
                                <TableHeaderCell
                                    label={column.label}
                                    sortable={column.sortable}
                                    sortDirection={column.sortKey === sortField ? sortDirection as 'asc' | 'desc' | null : null}
                                    onSort={column.sortable ? () => handleSort(column.sortKey || column.key) : undefined}
                                    data-testid={`proposal-table-header-cell-${column.key}`}
                                />
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody data-testid="proposal-table-body">
                    {proposals.data && proposals.data.map((proposal, index) => {
                        const proposalHash = proposal.id ?? '';
                        const helpers = getRowHelpers(proposalHash);

                        return (
                            <tr
                                key={proposalHash}
                                className={index < proposals.data.length - 1 ? 'border-b border-gray-200' : ''}
                                data-testid={`proposal-table-row-${proposalHash}`}
                            >
                                {columns.map(column => (
                                    <td
                                        key={`${proposalHash}-${column.key}`}
                                        className="border-gray-200 border-b border-r px-4 py-4 text-content last:border-r-0"
                                        data-testid={`proposal-table-cell-${proposalHash}-${column.key}`}
                                    >
                                        {column.renderCell(proposal, helpers)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {proposals &&
                proposals.data &&
                proposals.data.length > 0 && (
                    <div className="border-t border-gray-200 px-4 py-4">
                        <Paginator
                            pagination={proposals}
                            linkProps={{
                                preserveState: true,
                                preserveScroll: false
                            }}
                        />
                    </div>
                )}
        </div>
    );
};

export default ProposalTable;
