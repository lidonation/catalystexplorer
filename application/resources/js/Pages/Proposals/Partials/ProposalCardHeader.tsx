import { ListProvider } from '@/Context/ListContext';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import ProposalStatus from './ProposalStatus';
import Title from '@/Components/atoms/Title';

export default function ProposalCardHeader({
    proposal,
    userSelected,
    noSelectedUser,
    isHorizontal,
}: {
    proposal: App.DataTransferObjects.ProposalData;
    userSelected: App.DataTransferObjects.IdeascaleProfileData | null;
    noSelectedUser: () => void;
    isHorizontal: boolean;
}) {
    const gradientColors: Record<string, unknown> = {
        complete:
            'from-[var(--success-gradient-color-1)] to-[var(--success-gradient-color-2)]',
        default:
            'from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]',
    };
    const headerBGColor =
        gradientColors[proposal.status] || gradientColors.default;

    return (
        <header
            className={`text-content-light w-full rounded-xl bg-linear-to-tr ${headerBGColor} flex shrink flex-col ${isHorizontal ? 'h-full' : ''}`}
        >
            {/* Top Section */}
            <div className="grow">
                <div className="relative flex items-center justify-between px-4 py-3">
                    {userSelected ? (
                        <div>
                            <button
                                className="absolute top-4 right-4 rounded-lg bg-gray-600/50 p-2 text-white transition duration-200 ease-in-out hover:bg-gray-500/70 focus:outline-hidden"
                                onClick={noSelectedUser}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            <div className="relative flex items-center space-x-4 pt-16">
                                <img
                                    src={userSelected?.profile_photo_url}
                                    alt={`${userSelected?.name}'s profile`}
                                    className="relative inline-block h-10 w-10 rounded-full ring-2 ring-white"
                                />
                                <Title level='3'>{userSelected?.name}</Title>
                            </div>
                        </div>
                    ) : (
                        <>
                            <ProposalStatus
                                status={proposal.status}
                                funding_status={proposal.funding_status}
                            />

                            <ListProvider>
                                {proposal.hash && (
                                    <BookmarkButton
                                        modelType="proposals"
                                        itemId={proposal.hash}
                                    />
                                )}
                            </ListProvider>
                        </>
                    )}
                </div>
                {/* Card Content */}
                <div
                    className={`min-h-20 p-2 px-4 leading-tight ${!isHorizontal ? '' : 'flex h-full w-full items-center justify-center'}`}
                >
                    <a
                        href={proposal.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:text-primary font-medium ${
                            isHorizontal ? 'mb-4 text-center' : ''
                        }`}
                    >
                        {!userSelected ? proposal.title : null}
                    </a>
                    <div className="flex flex-row justify-end py-0.5 italic">
                        <span>~ {proposal.fund?.title}</span>
                    </div>
                </div>
            </div>

            {!userSelected &&
                (proposal.ideascale_link ||
                    proposal.projectcatalyst_io_link) && (
                    <nav
                        className="text-content-light flex items-center justify-evenly rounded-b-xl bg-white/25 p-2 font-semibold"
                        aria-label="Related Platforms"
                    >
                        {proposal.ideascale_link && (
                            <a
                                href={proposal.ideascale_link}
                                className="text-4 text-opacity-100 flex w-full items-center justify-center"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span>Ideascale</span>
                            </a>
                        )}
                        {proposal.ideascale_link &&
                            proposal.projectcatalyst_io_link && (
                                <div className="mx-2 h-3 border-r"></div>
                            )}
                        {proposal.projectcatalyst_io_link && (
                            <a
                                href={proposal.projectcatalyst_io_link}
                                className="text-4 text-opacity-100 flex w-full items-center justify-center"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span>Projectcatalyst.io</span>
                            </a>
                        )}
                    </nav>
                )}
        </header>
    );
}
