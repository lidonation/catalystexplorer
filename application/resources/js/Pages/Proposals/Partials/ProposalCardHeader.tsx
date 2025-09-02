import Button from '@/Components/atoms/Button';
import Title from '@/Components/atoms/Title';
import ExpandableContent from '@/Components/ExpandableContent';
import ExpandableContentAnimation from '@/Components/ExpandableContentAnimation';
import { ListProvider } from '@/Context/ListContext';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { getUuid } from '@/utils/getPreferredId';
import CompareButton from './CompareButton';
import ProposalStatus from './ProposalStatus';
import UserAvatar from '@/Components/UserAvatar';

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
    const [isHovered, setIsHovered] = useState(false);
    const contentRef = useRef<HTMLParagraphElement | null>(null);
    const [lineCount, setLineCount] = useState(0);
    const { t } = useLaravelReactI18n();
    const proposalId = proposal.id ?? '';

    const gradientColors: Record<string, unknown> = {
        complete: 'from-[var(--success-gradient-color-1)] to-[var(--success-gradient-color-2)]',
        default: 'from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]',
    };

    const headerBGColor =
        proposal?.status === 'complete' ? gradientColors.complete : gradientColors.default;

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
            const height = element.offsetHeight;
            setLineCount(Math.round(height / lineHeight));
        }
    }, [proposal?.title]);

    return (
        <ExpandableContentAnimation
            lineClamp={3}
            contentRef={contentRef}
            onHoverChange={setIsHovered}
        >
            <header
                className={`min-h-[10rem] text-content-light w-full rounded-xl bg-linear-to-tr ${headerBGColor} flex flex-col justify-between ${isHorizontal ? 'h-full' : ''}`}
                data-testid={`proposal-card-header-${proposalId}`}
            >
                <div className="px-4 pt-3">
                    {userSelected ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <UserAvatar
                                        name={userSelected?.name ?? userSelected?.username}
                                        imageUrl={userSelected?.hero_img_url}
                                        size="size-10"
                                    />
                                    <Title level="4">{userSelected?.name}</Title>
                                </div>
                                <Button
                                    className="bg-background text-content hover:bg-background rounded-lg p-2 transition duration-200 ease-in-out focus:outline-hidden"
                                    onClick={noSelectedUser}
                                    data-testid="close-profile-button"
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
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <ProposalStatus
                                status={proposal.status}
                                funding_status={proposal?.funding_status}
                                data-testid="proposal-status"
                            />
                            <div className="flex items-center">
                                <ListProvider>
                                    {proposalId && (
                                        <BookmarkButton
                                            modelType="proposals"
                                            itemId={proposalId}
                                            data-testid="bookmark-button"
                                        />
                                    )}
                                </ListProvider>
                                {proposalId && (
                                    <CompareButton
                                        model="proposal"
                                        hash={proposalId}
                                        tooltipDescription="Compare Proposals"
                                        data={proposal}
                                        data-testid={`compare-button`}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Proposal Title and Fund */}
                <div
                    className={`min-h-20 px-4 pb-2 leading-tight ${isHorizontal ? 'flex items-center justify-center text-center' : ''}`}
                    style={{ overflow: 'visible' }}
                >
                    {!userSelected && (
                        <Link
                            href={proposal.link}
                            className="hover:text-primary font-medium w-full"
                            data-testid={`single-proposal-card-link-${proposalId}`}
                            style={{ overflow: 'visible' }}
                        >
                            <div ref={contentRef}>
                                <ExpandableContent
                                    className="text-ellipsis"
                                    lineClamp={3}
                                    expanded={isHovered}
                                >
                                    <Title level="4" data-testid={`proposal-card-title-${proposalId}`}>
                                        {proposal.title}
                                    </Title>
                                </ExpandableContent>
                            </div>
                        </Link>
                    )}
                    <div className="flex justify-end italic py-0.5" data-testid="proposal-card-fund">
                        <span>~ {proposal.fund?.label}</span>
                    </div>
                </div>

                {/* Links to Ideascale / ProjectCatalyst */}
                {!userSelected &&
                    (proposal.ideascale_link || proposal.projectcatalyst_io_link) && (
                        <nav
                            className="text-content-light flex items-center justify-evenly rounded-b-xl bg-white/25 p-2 font-semibold"
                            aria-label="Related Platforms"
                            data-testid={`related-platforms-proposal-card-links-${proposalId}`}
                        >
                            {proposal.ideascale_link && (
                                <a
                                    href={proposal.ideascale_link}
                                    className="text-4 text-opacity-100 flex w-full items-center justify-center"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-testid={`ideascale-link-${proposalId}`}
                                >
                                    <span>{t('proposals.ideascale')}</span>
                                </a>
                            )}
                            {proposal.ideascale_link && proposal.projectcatalyst_io_link && (
                                <div className="mx-2 h-3 border-r" />
                            )}
                            {proposal.projectcatalyst_io_link && (
                                <a
                                    href={proposal.projectcatalyst_io_link}
                                    className="text-4 text-opacity-100 flex w-full items-center justify-center"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-testid={`projectcatalyst-link-${proposalId}`}
                                >
                                    <span>{t('proposals.projectCatalyst')}</span>
                                </a>
                            )}
                        </nav>
                    )}
            </header>
        </ExpandableContentAnimation>
    );
}
