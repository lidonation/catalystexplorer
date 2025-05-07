import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import ManageProposalButton from '@/Pages/My/Proposals/partials/ManageProposalButton';
import ProposalCardHeader from '@/Pages/Proposals/Partials/ProposalCardHeader';
import ProposalFundingPercentages from '@/Pages/Proposals/Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableHeaderCell from './ProposalTableHeaderCell';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { router } from '@inertiajs/react';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface ColumnConfig {
    key: string;
    label: string;
    sortable?: boolean;
    sortKey?: string;
    renderCell: (
        proposal: ProposalData,
        helpers: TableHelpers,
    ) => React.ReactNode;
}

interface TableHelpers {
    selectedUser: IdeascaleProfileData | null;
    handleUserClick: (user: IdeascaleProfileData) => void;
    noSelectedUser: () => void;
}

interface ProposalTableProps {
    proposals: ProposalData[];
}

const ProposalTable: React.FC<ProposalTableProps> = ({ proposals }) => {
    const { t } = useTranslation();
    const { setFilters, getFilter } = useFilterContext();
    const [selectedUserMap, setSelectedUserMap] = useState<
        Record<string, IdeascaleProfileData | null>
    >({});

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
                label: 'Sort',
            });
        } else {
            setFilters({
                param: ParamsEnum.SORTS,
                value: `${key}:${direction}`,
                label: 'Sort',
            });
        }
    };

    const columns: ColumnConfig[] = [
        {
            key: 'proposal',
            label: t('proposal'),
            sortable: true,
            sortKey: 'title',
            renderCell: (proposal, { selectedUser, noSelectedUser }) => (
                <div className="w-80">
                    <ProposalCardHeader
                        proposal={proposal}
                        userSelected={selectedUser}
                        noSelectedUser={noSelectedUser}
                        isHorizontal={false}
                    />
                </div>
            ),
        },
        {
            key: 'status',
            label: t('proposals.status'),
            sortable: true,
            sortKey: 'funding_status',
            renderCell: (proposal) => (
                <div>
                    <ProposalFundingStatus
                        funding_status={proposal.funding_status ?? ''}
                    />
                </div>
            ),
        },
        {
            key: 'funding',
            label: t('proposals.fundingReceived'),
            sortable: true,
            sortKey: 'amount_received',
            renderCell: (proposal) => (
                <div className="flex w-60">
                    <ProposalFundingPercentages proposal={proposal} />
                </div>
            ),
        },
        {
            key: 'teams',
            label: t('teams'),
            sortable: false,
            sortKey: 'users.proposals_completed',
            renderCell: (proposal, { handleUserClick }) => (
                <div className="w-40">
                    <IdeascaleProfileUsers
                        users={proposal.users}
                        onUserClick={handleUserClick}
                        className="bg-content-light"
                        toolTipProps={t('proposals.viewTeam')}
                    />
                </div>
            ),
        },
        {
            key: 'action',
            label: t('proposals.action'),
            renderCell: (proposal) => (
                <div>
                    <ManageProposalButton proposal={proposal} />
                </div>
            ),
        },
    ];

    const getRowHelpers = useCallback(
        (proposalHash: string): TableHelpers => {
            return {
                selectedUser: selectedUserMap[proposalHash] ?? null,
                handleUserClick: (user: IdeascaleProfileData) => {
                    setSelectedUserMap((prev) => ({
                        ...prev,
                        [proposalHash]: user,
                    }));
                },
                noSelectedUser: () => {
                    setSelectedUserMap((prev) => ({
                        ...prev,
                        [proposalHash]: null,
                    }));
                },
            };
        },
        [selectedUserMap],
    );

    return (
        <div className="w-full border border-background-lighter rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="border-b bg-background border-background-lighter">
                        <tr>
                            {columns.map(column => (
                                <TableHeaderCell
                                    key={column.key}
                                    label={column.label}
                                    sortable={column.sortable}
                                    sortDirection={column.sortKey === sortField ? sortDirection as 'asc' | 'desc' | null : null}
                                    onSort={column.sortable ? () => handleSort(column.sortKey || column.key) : undefined}
                                />
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-background">
                        {proposals.map((proposal, index) => {
                            const proposalHash = proposal.hash ?? '';
                            const helpers = getRowHelpers(proposalHash);

                            return (
                                <tr
                                    key={proposalHash}
                                    className={index < proposals.length - 1 ? 'border-b border-background-lighter' : ''}
                                >
                                    {columns.map(column => (
                                        <td
                                            key={`${proposalHash}-${column.key}`}
                                            className="px-4 py-4 border-r border-background-lighter"
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
        </div>
    );
};

export default ProposalTable;