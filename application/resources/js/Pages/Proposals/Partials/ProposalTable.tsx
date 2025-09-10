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
import { currency } from '@/utils/currency';

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

type ColumnKey =
    | 'title'
    | 'proposal'
    | 'fund'
    | 'status'
    | 'funding'
    | 'teams'
    | 'yesVotes'
    | 'abstainVotes'
    | 'action'
    | 'viewProposal'
    | 'budget'
    | 'category'
    | 'openSourced';

interface CustomActionProps {
    proposal: ProposalData;
    'data-testid'?: string;
}

interface TableStyleProps {
    tableWrapper?: string;
    tableHeader?: string;
    headerCell?: string;
    tableBody?: string;
    bodyCell?: string;
    table?: string;
    headerText?: string;
}

interface ProposalTableProps {
    proposals: PaginatedData<ProposalData[]> | { data: ProposalData[], total: number, isPdf: boolean };
    columns?: ColumnKey[];
    actionType?: ActionType;
    disableSorting?: boolean;
    showPagination?: boolean;
    columnVisibility?: Record<string, boolean>;
    customActions?: {
        manage?: React.ComponentType<CustomActionProps>;
        view?: React.ComponentType<CustomActionProps>;
    };
    renderActions?: {
        manage?: (proposal: ProposalData) => React.ReactNode;
        view?: (proposal: ProposalData) => React.ReactNode;
    };
    customStyles?: TableStyleProps;
    headerAlignment?: 'left' | 'center' | 'right';
}

const ProposalTable: React.FC<ProposalTableProps> = ({
                                                         proposals,
                                                         columns,
                                                         actionType = 'manage',
                                                         disableSorting = false,
                                                         showPagination = true,
                                                         customActions,
                                                         renderActions,
                                                         customStyles,
                                                         headerAlignment = 'left'
                                                     }) => {
    const { t } = useLaravelReactI18n();
    const { setFilters, getFilter } = useFilterContext();
    const [selectedUserMap, setSelectedUserMap] = useState<
        Record<string, IdeascaleProfileData | null>
    >({});

    const defaultColumns: ColumnKey[] = [
        'proposal',
        'status',
        'funding',
        'teams',
        actionType === 'manage' ? 'action' : 'viewProposal'
    ].filter(Boolean) as ColumnKey[];

    const activeColumns = columns || defaultColumns;

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

    const columnDefinitions: Record<ColumnKey, ColumnConfig> = {
        title: {
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
        proposal: {
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
            )
        },
        fund: {
            key: 'fund',
            label: t('proposalComparison.tableHeaders.fund'),
            sortable: !disableSorting,
            sortKey: 'fund_id',
            renderCell: (proposal: ProposalData) => (
                <div
                    className="flex items-center justify-center border border-light-gray-persist bg-light-gray-persist/[10%] px-1 rounded-md"
                    data-testid={`proposal-fund-${proposal.id}`}
                >
                    {proposal.fund?.label && (
                        <Paragraph className="items-center py-1 rounded-full text-xs font-medium text-content text-nowrap"
                                  data-testid={`proposal-fund-label-${proposal.id}`}>
                            {proposal.fund.label}
                        </Paragraph>
                    )}
                </div>
            )
        },
        status: {
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
        funding: {
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
        teams: {
            key: 'teams',
            label: t('teams'),
            sortable: false,
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
        yesVotes: {
            key: 'yesVotes',
            label: (
                <div className="flex items-center gap-2" data-testid="yes-votes-header">
                    <YesVoteIcon
                        className="size-5 font-medium text-success"
                        width={20}
                        height={20}
                        data-testid="yes-vote-icon"
                    />
                    <div className="flex gap-2 text-content/60" data-testid="yes-votes-label">
                        <Paragraph size="sm">{t('yesVotes')}</Paragraph>
                    </div>
                </div>
            ),
            sortable: !disableSorting,
            sortKey: 'yes_votes_count',
            renderCell: (proposal: ProposalData) => (
                <div className="text-center" data-testid={`proposal-yes-votes-${proposal.id}`}>
                    <div className="flex items-center justify-center gap-2"
                         data-testid={`proposal-yes-votes-content-${proposal.id}`}>
                        <Paragraph className="text-light-gray-persist"
                                   data-testid={`proposal-yes-votes-count-${proposal.id}`}>
                            ({shortNumber(proposal.yes_votes_count) || '0'})
                        </Paragraph>
                    </div>
                </div>
            )
        },
        abstainVotes: {
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
                                   data-testid={`proposal-abstain-votes-count-${proposal.id}`}>
                            ({shortNumber(proposal.abstain_votes_count) || '0'})
                        </Paragraph>
                    </div>
                </div>
            )
        },
        action: {
            key: 'action',
            label: t('proposals.action'),
            renderCell: (proposal: ProposalData) => {
                const testId = `proposal-action-${proposal.id}`;

                if (renderActions?.manage) {
                    return (
                        <div data-testid={testId}>
                            {renderActions.manage(proposal)}
                        </div>
                    );
                }

                if (customActions?.manage) {
                    const CustomManageAction = customActions.manage;
                    return (
                        <div data-testid={testId}>
                            <CustomManageAction
                                proposal={proposal}
                                data-testid={`manage-proposal-button-${proposal.id}`}
                            />
                        </div>
                    );
                }

                return (
                    <div data-testid={testId}>
                        <ManageProposalButton
                            proposal={proposal}
                            data-testid={`manage-proposal-button-${proposal.id}`}
                        />
                    </div>
                );
            }
        },
        viewProposal: {
            key: 'viewProposal',
            label: t('proposals.action'),
            renderCell: (proposal: ProposalData) => {
                const testId = `proposal-view-${proposal.id}`;

                if (renderActions?.view) {
                    return (
                        <div data-testid={testId}>
                            {renderActions.view(proposal)}
                        </div>
                    );
                }

                if (customActions?.view) {
                    const CustomViewAction = customActions.view;
                    return (
                        <div data-testid={testId}>
                            <CustomViewAction
                                proposal={proposal}
                                data-testid={`view-proposal-actions-${proposal.id}`}
                            />
                        </div>
                    );
                }

                return (
                    <div className="w-32" data-testid={testId}>
                        <a
                            href={proposal.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors duration-200 font-medium text-sm"
                            data-testid={`view-proposal-button-${proposal.id}`}
                        >
                            {t('proposalComparison.viewProposal')}
                        </a>
                    </div>
                );
            }
        },
        budget: {
            key: 'budget',
            label: t('proposalComparison.tableHeaders.budget'),
            sortable: !disableSorting,
            sortKey: 'amount_requested',
            renderCell: (proposal: ProposalData) => {
                const currencyCode = proposal.currency || 'USD';
                const formattedBudget = proposal.amount_requested
                    ? (currency(parseInt(proposal.amount_requested.toString()), 2, currencyCode) as string)
                    : 'N/A';

                return (
                    <div data-testid={`proposal-budget-${proposal.id}`}>
                        <Paragraph className="text-md font-medium text-content" data-testid={`proposal-budget-amount-${proposal.id}`}>
                            {formattedBudget}
                        </Paragraph>
                    </div>
                );
            }
        },
        category: {
            key: 'category',
            label: t('proposalComparison.tableHeaders.category'),
            sortable: !disableSorting,
            sortKey: 'campaign_id',
            renderCell: (proposal: ProposalData) => (
                <div data-testid={`proposal-category-${proposal.id}`}>
                    <div className="flex items-center">
                        <Paragraph className="text-md" data-testid={`proposal-campaign-label-${proposal.id}`}>
                            {proposal.campaign?.title || proposal.fund?.label || 'N/A'}
                        </Paragraph>
                    </div>
                </div>
            )
        },
        openSourced: {
            key: 'openSourced',
            label: t('proposals.openSourced'),
            sortable: !disableSorting,
            sortKey: 'opensourced',
            renderCell: (proposal: ProposalData) => (
                <div className="text-center w-24" data-testid={`proposal-opensourced-${proposal.id}`}>
                    <Paragraph className={`inline-flex items-center px-2 py-1 text-xs font-medium`} data-testid={`proposal-opensourced-status-${proposal.id}`}>
                        {proposal.opensource ? t('Yes') : t('No')}
                    </Paragraph>
                </div>
            )
        }
    };

    const orderedColumns: ColumnConfig[] = activeColumns
        .map(columnKey => columnDefinitions[columnKey])
        .filter(Boolean);

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

    const defaultStyles: TableStyleProps = {
        tableWrapper: 'mb-8 rounded-lg border-2 border-gray-200 bg-background shadow-md',
        tableHeader: 'border-gray-200 whitespace-nowrap bg-background-lighter',
        headerCell: 'border-gray-200 border-b border-r px-4 py-3 text-left font-medium text-content last:border-r-0',
        tableBody: '',
        bodyCell: 'border-gray-200 border-b border-r px-4 py-4 text-content last:border-r-0',
        table: 'w-max min-w-full',
        headerText: 'text-content/60'
    };

    // Merge custom styles with defaults - custom styles will override defaults
    const styles = {
        tableWrapper: `${defaultStyles.tableWrapper} ${customStyles?.tableWrapper || ''}`.trim(),
        tableHeader: `${defaultStyles.tableHeader} ${customStyles?.tableHeader || ''}`.trim(),
        headerCell: `${defaultStyles.headerCell} ${customStyles?.headerCell || ''}`.trim(),
        tableBody: `${defaultStyles.tableBody} ${customStyles?.tableBody || ''}`.trim(),
        bodyCell: `${defaultStyles.bodyCell} ${customStyles?.bodyCell || ''}`.trim(),
        table: `${defaultStyles.table} ${customStyles?.table || ''}`.trim(),
        headerText: customStyles?.headerText || defaultStyles.headerText
    };

    return (
        <div className={styles.tableWrapper}>
            <div className="overflow-x-auto">
                <table className={styles.table}>
                    <thead className={styles.tableHeader}
                           data-testid="proposal-table-header">
                    <tr data-testid="proposal-table-header-row">
                        {orderedColumns.map(column => (
                            <th
                                key={column.key}
                                className={styles.headerCell}
                                data-testid={`proposal-table-header-${column.key}`}
                            >
                                <TableHeaderCell
                                    label={column.label}
                                    sortable={column.sortable}
                                    sortDirection={column.sortKey === sortField ? sortDirection as 'asc' | 'desc' | null : null}
                                    onSort={column.sortable ? () => handleSort(column.sortKey || column.key) : undefined}
                                    alignment={headerAlignment}
                                    textColorClass={styles.headerText}
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
                                {orderedColumns.map(column => (
                                    <td
                                        key={`${proposalHash}-${column.key}`}
                                        className={styles.bodyCell}
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

            {showPagination && proposals && proposals.data && proposals.data.length > 0 && 'current_page' in proposals && (
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
