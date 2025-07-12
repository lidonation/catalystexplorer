import PrimaryLink from '@/Components/atoms/PrimaryLink';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import { IndexedDBService } from '@/Services/IndexDbService';
import { shortNumber } from '@/utils/shortNumber';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grab, MinusSquareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProposalFundingPercentages from '../Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '../Partials/ProposalFundingStatus';
import ColumnHeader from './Partials/ColumnHeader';
import ProposalData = App.DataTransferObjects.ProposalData;
import ProposalSolution from '../Partials/ProposalSolution';
import Paragraph from '@/Components/atoms/Paragraph';

export default function SortableProposalColumn({
    proposal,
    isLast,
    visibleRows,
}: {
    proposal: ProposalData;
    isLast: boolean;
    visibleRows: string[];
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: proposal.hash ?? `${Math.random() + 'proposal'}`,
    });

    const { t } = useTranslation();

    const rows = [
        {
            id: 'reorder',
            label: t('proposalComparison.tableHeaders.reorder'),
            height: 'h-16',
        },
        {
            id: 'title',
            label: t('proposalComparison.tableHeaders.title'),
            height: 'h-32',
        },
        {
            id: 'campaign',
            label: t('proposalComparison.tableHeaders.campaign'),
            height: 'h-16',
        },
        {
            id: 'fund',
            label: t('proposalComparison.tableHeaders.fund'),
            height: 'h-16',
        },
        {
            id: 'status',
            label: t('proposalComparison.tableHeaders.status'),
            height: 'h-16',
        },
        {
            id: 'problem',
            label: t('proposalComparison.tableHeaders.problem'),
            height: 'h-42',
        },
        {
            id: 'solution',
            label: t('proposalComparison.tableHeaders.solution'),
            height: 'h-42',
        },
        {
            id: 'funding',
            label: t('proposalComparison.tableHeaders.funding'),
            height: 'h-24',
        },
        {
            id: 'yes-votes',
            label: t('proposalComparison.tableHeaders.yesVotes'),
            height: 'h-16',
        },
        {
            id: 'no-votes',
            label: t('proposalComparison.tableHeaders.noVotes'),
            height: 'h-16',
        },
        {
            id: 'team',
            label: t('proposalComparison.tableHeaders.team'),
            height: 'h-16',
        },
        {
            id: 'opensource',
            label: t('proposalComparison.tableHeaders.openSource'),
            height: 'h-16',
        },
        {
            id: 'action',
            label: t('proposalComparison.tableHeaders.action'),
            height: 'h-16',
        },
    ];

    const getRowData = (rowId: string) => {
        return rows.find(row => row.id === rowId);
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        position: isDragging ? 'relative' : ('static' as 'relative' | 'static'),
        opacity: isDragging ? 0.8 : 1,
    };

    const handleRemove = async () => {
        await IndexedDBService.remove(
            'proposal_comparisons',
            proposal.hash ?? '',
        );
    };

    const isRowVisible = (rowId: string) => visibleRows.includes(rowId);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-background flex w-80 flex-col"
            data-testid={`sortable-proposal-column-${proposal.hash}`}
        >
            {/* Reorder */}
            <div
                className={`${getRowData('reorder')?.height} !bg-background-lighter border-gray-light flex items-center justify-between border-r border-b p-4 ${isLast ? 'rounded-tr-lg' : ''} `}
                data-testid="sortable-proposal-reorder-container"
            >
                <div className="flex cursor-move items-center gap-1">
                    <Grab className="text-dark h-4 w-4" />
                    <Paragraph size="sm" className="text-dark">
                        {t('proposalComparison.tableHeaders.reorder')}
                    </Paragraph>
                </div>
                <MinusSquareIcon
                    onClick={() => handleRemove()}
                    className="text-dark h-4 w-4 cursor-pointer"
                    data-testid="sortable-proposal-remove"
                />
            </div>

            {/* Title */}
            {isRowVisible('title') && (
                <div
                    className={`${getRowData('title')?.height} border-gray-light flex items-center border-r border-b p-4`}
                    data-testid="sortable-proposal-title"
                >
                    <ColumnHeader proposal={proposal} />
                </div>
            )}

            {/* Campaign */}
            {isRowVisible('campaign') && (
                <div
                    className={`${getRowData('campaign')?.height} border-gray-light flex items-center border-r border-b p-4`}
                    data-testid="sortable-proposal-campaign"
                >
                    <Paragraph size="md">
                        {proposal?.campaign?.title || 'N/A'}
                    </Paragraph>
                </div>
            )}

            {/* Fund */}
            {isRowVisible('fund') && (
                <div
                    className={`${getRowData('fund')?.height} border-gray-light flex items-center border-r border-b p-4`}
                    data-testid="sortable-proposal-fund"
                >
                    <span className="text-dark-persist bg-content-light rounded-md px-2 py-1 text-xs">
                        {proposal?.fund?.title}
                    </span>
                </div>
            )}

            {/* Status */}
            {isRowVisible('status') && (
                <div
                    className={`${getRowData('status')?.height} border-gray-light flex items-center border-r border-b p-4`}
                    data-testid="sortable-proposal-status"
                >
                    <ProposalFundingStatus
                        funding_status={proposal.funding_status}
                    />
                </div>
            )}

            {/* Problem */}
            {isRowVisible('problem') && (
                <div
                    className={`${getRowData('problem')?.height} border-gray-light bg-background flex items-center border-r border-b p-4`}
                    data-testid="sortable-proposal-problem"
                >
                    <ProposalSolution problem={proposal.problem} />
                </div>
            )}

            {/* Solution */}
            {isRowVisible('solution') && (
                <div
                    className={`${getRowData('solution')?.height} border-gray-light bg-background flex items-center border-r border-b p-4`}
                    data-testid="sortable-proposal-solution"
                >
                    <ProposalSolution solution={proposal.solution} />
                </div>
            )}

            {/* Funding Received */}
            {isRowVisible('funding') && (
                <div
                    className={`${getRowData('funding')?.height} border-gray-light flex flex-col border-r border-b p-4`}
                    data-testid="sortable-proposal-funding"
                >
                    <ProposalFundingPercentages proposal={proposal} />
                </div>
            )}

            {/* Yes Votes */}
            {isRowVisible('yes-votes') && (
                   <div
                    className={`${getRowData('yes-votes')?.height} border-gray-light flex items-center border-r border-b p-4`}
                    data-testid="sortable-proposal-yes-votes"
                >
                    <div className="flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="text-success size-5 font-medium"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                            />
                        </svg>
                        <span className="flex gap-4">
                            <span className="font-semibold">{t('yes')}</span>
                            <span className="text-highlight">
                                ({shortNumber(proposal.yes_votes_count ?? 0)})
                            </span>
                        </span>
                    </div>
                </div>
            )}

            {/* No Votes */}
            {isRowVisible('no-votes') && (
                <div
                    className={`${getRowData('no-votes')?.height} border-gray-light flex items-center border-r border-b p-4`}
                    data-testid="sortable-proposal-no-votes"
                >
                    <div className="flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-4 font-medium"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"
                            />
                        </svg>
                        <span className="flex gap-4">
                            <span className="font-semibold">{t('abstain')}</span>
                            <span className="text-highlight">
                                ({shortNumber(proposal.abstain_votes_count ?? 0)})
                            </span>
                        </span>
                    </div>
                </div>
            )}

            {/* Team */}
            {isRowVisible('team') && (
                <div
                    className={`${getRowData('team')?.height} border-gray-light flex items-center border-r border-b p-4`}
                    data-testid="sortable-proposal-team"
                >
                    <IdeascaleProfileUsers
                        users={proposal?.users}
                        onUserClick={() => ''}
                        className="bg-content-light"
                        toolTipProps={t('proposals.viewTeam')}
                    />
                </div>
            )}


            {/* Open Source */}
            {isRowVisible('opensource') && (
                <div
                    className={`${getRowData('opensource')?.height} border-gray-light flex items-center border-r border-b p-4`}
                    data-testid="sortable-proposal-opensource"
                >
                    <span className="text-dark-persist bg-content-light rounded-md px-2 py-1 text-xs">
                        {proposal.opensource ? 'OpenSource' : 'Non-OpenSource'}
                    </span>
                </div>
            )}

            {/* View Button */}
            <div
                className={`${getRowData('action')?.height} border-gray-light flex items-center border-r border-b p-4`}
            >
                <PrimaryLink
                    href={proposal.link ?? '#'}
                    className="h-8 w-full text-sm"
                    data-testid="sortable-proposal-view"
                >
                    {t('proposalComparison.viewProposal')}
                </PrimaryLink>
            </div>

        </div>
    );
}
