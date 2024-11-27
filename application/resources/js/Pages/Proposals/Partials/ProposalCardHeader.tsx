import ProposalStatus from './ProposalStatus';
import ProposalBookmark from './ProposalBookmark';

export default function ProposalCardHeader({
    proposal,
    userSelected,
    noSelectedUser,
    isHorizontal
}: {
    proposal: App.DataTransferObjects.ProposalData;
    userSelected: App.DataTransferObjects.IdeascaleProfileData | null;
    noSelectedUser: () => void;
    isHorizontal: boolean;
}) {
    const gradientColors: Record<string, unknown> = {
        complete: 'from-[var(--success-gradient-color-1)] to-[var(--success-gradient-color-2)]',
        default: 'from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]',
    };
    const headerBGColor = gradientColors[proposal.status] || gradientColors.default;

    return (

        <header
            className={`rounded-xl bg-gradient-to-tr text-content-light w-full ${headerBGColor} flex flex-shrink flex-col ${isHorizontal ? ' h-full' : ''}`}
        >
            {/* Top Section */}
            <div className="flex-grow">
                <div className="relative flex items-center justify-between p-4">
                    {userSelected ? (
                        <div>
                            <button
                                className="absolute top-4 right-4 bg-gray-600/50 text-white hover:bg-gray-500/70 focus:outline-none rounded-lg p-2 transition duration-200 ease-in-out"
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
                                    className="relative inline-block w-10 h-10 rounded-full ring-2 ring-white"
                                />
                                <h2>{userSelected?.name}</h2>
                            </div>
                        </div>
                    ) : (
                        <>
                            <ProposalStatus status={proposal.status} />
                            <ProposalBookmark />
                        </>
                    )}
                </div>
                {/* Card Content */}
                <div
                    className={`mb-4 p-2 px-4 leading-tight ${!isHorizontal ? "" : "flex items-center justify-center h-full w-full"}`}>
                    <a
                        href="#"
                        className={`text-2 font-medium hover:text-primary  ${isHorizontal ? "text-center mb-4" : ""
                            }`}
                    >
                        {!userSelected ? proposal.title : null}
                    </a>
                </div>
            </div>

            {!userSelected && (proposal.ideascale_link || proposal.projectcatalyst_io_link) && (
                <nav className="flex items-center justify-evenly rounded-b-xl bg-white bg-opacity-10 p-2 font-semibold text-content-light" aria-label="Related Platforms">
                    {proposal.ideascale_link && (
                        <a href={proposal.ideascale_link} className="text-4 flex w-full items-center justify-center text-opacity-100" target="_blank" rel="noopener noreferrer">
                            <span>Ideascale</span>
                        </a>
                    )}
                    {proposal.ideascale_link && proposal.projectcatalyst_io_link && (
                        <div className="mx-2 h-3 border-r"></div>
                    )}
                    {proposal.projectcatalyst_io_link && (
                        <a href={proposal.projectcatalyst_io_link} className="text-4 flex w-full items-center justify-center text-opacity-100" target="_blank" rel="noopener noreferrer">
                            <span>Projectcatalyst.io</span>
                        </a>
                    )}
                </nav>
            )}
        </header >
    );
};
