import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import ManageProposalButton from '@/Pages/My/Proposals/partials/ManageProposalButton';
import ProposalCardHeader from '@/Pages/Proposals/Partials/ProposalCardHeader';
import ProposalFundingPercentages from '@/Pages/Proposals/Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableHeaderCell from './ProposalTableHeaderCell';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface ColumnConfig {
    key: string;
    label: string;
    sortable?: boolean;
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
    const [selectedUserMap, setSelectedUserMap] = useState<
        Record<string, IdeascaleProfileData | null>
    >({});
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc';
    } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key) {
            direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        }
        setSortConfig({ key, direction });
    };

    const columns: ColumnConfig[] = [
        {
            key: 'proposal',
            label: t('proposal'),
            sortable: true,
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
            renderCell: (proposal) => (
                <div className="flex w-60">
                    <ProposalFundingPercentages proposal={proposal} />
                </div>
            ),
        },
        {
            key: 'teams',
            label: t('teams'),
            sortable: true,
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
                  onSort={column.sortable ? () => handleSort(column.key) : undefined}
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
