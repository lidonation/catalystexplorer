import PrimaryLink from '@/Components/atoms/PrimaryLink';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grab } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProposalFundingPercentages from '../Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '../Partials/ProposalFundingStatus';
import ColumnHeader from './Partials/ColumnHeader';
import ProposalData = App.DataTransferObjects.ProposalData;
import { shortNumber } from '@/utils/shortNumber';

export default function SortableProposalColumn({
    proposal,
}: {
    proposal: ProposalData;
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
        { id: 'reorder', label: 'Reorder', height: 'h-16' },
        { id: 'title', label: 'Title', height: 'h-32' },
        { id: 'fund', label: 'Fund', height: 'h-16' },
        { id: 'status', label: 'Status', height: 'h-16' },
        { id: 'solution', label: 'Solution', height: 'h-42' },
        { id: 'funding', label: 'Funding Received', height: 'h-24' },
        { id: 'yes-votes', label: 'Yes Votes', height: 'h-16' },
        { id: 'no-votes', label: 'No Votes', height: 'h-16' },
        { id: 'team', label: 'Team', height: 'h-16' },
        { id: 'action', label: 'Action', height: 'h-16' },
    ];

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        position: isDragging ? 'relative' : ('static' as 'relative' | 'static'),
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex w-72 cursor-move flex-col bg-white"
        >
            {/* Reorder */}
            <div
                className={`${rows[0].height} border-gray-light flex items-center justify-center border-r border-b p-2`}
            >
                <div className="flex items-center justify-center gap-1">
                    <Grab className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Reorder</span>
                </div>
            </div>

            {/* Title */}
            <div
                className={`${rows[1].height} border-gray-light flex items-center justify-center border-r border-b p-2`}
            >
                <ColumnHeader proposal={proposal} />
            </div>

            {/* Fund */}
            <div
                className={`${rows[2].height} border-gray-light flex items-center justify-center border-r border-b p-2`}
            >
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                    {proposal?.fund?.title}
                </span>
            </div>

            {/* Status */}
            <div
                className={`${rows[3].height} border-gray-light flex items-center border-r border-b p-2`}
            >
                {' '}
                <ProposalFundingStatus
                    funding_status={proposal.funding_status}
                />
            </div>

            {/* Solution */}
            <div
                className={`${rows[4].height} border-gray-light flex items-center border-r border-b p-2`}
            >
                <p className="line-clamp-2">{proposal.solution}</p>
            </div>

            {/* Funding Received */}
            <div
                className={`${rows[5].height} border-gray-light flex flex-col justify-center border-r border-b p-2`}
            >
                <ProposalFundingPercentages proposal={proposal} />
            </div>

            {/* Yes Votes */}
            <div
                className={`${rows[6].height} border-gray-light flex items-center border-r border-b p-2`}
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
                    <span className="flex gap-2">
                        <span className="font-semibold">{t('yes')}</span>
                        <span className="text-highlight">
                            ({shortNumber(proposal.yes_votes_count ?? 0)})
                        </span>
                    </span>
                </div>
            </div>

            {/* No Votes */}
            <div
                className={`${rows[7].height} border-gray-light flex items-center border-r border-b p-2`}
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
                    <span className="flex gap-2">
                        <span className="font-semibold">{t('abstain')}</span>
                        <span className="text-highlight">
                            ({shortNumber(proposal.abstain_votes_count ?? 0)})
                        </span>
                    </span>
                </div>
            </div>

            {/* Team */}
            <div
                className={`${rows[8].height} border-gray-light flex items-center border-r border-b p-2`}
            >
                <IdeascaleProfileUsers
                    users={proposal?.users}
                    onUserClick={() => ''}
                    className="bg-content-light"
                    toolTipProps={t('proposals.viewTeam')}
                />
            </div>

            {/* View Proposal Button */}
            <div
                className={`${rows[9].height} border-gray-light flex items-center border-r border-b p-2`}
            >
                <PrimaryLink href={proposal.link ?? '#'} className="h-8 w-full">
                    View Proposal
                </PrimaryLink>
            </div>
        </div>
    );
}
