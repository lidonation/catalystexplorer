import Button from '@/Components/atoms/Button';
import Title from '@/Components/atoms/Title';
import ExpandableContent from '@/Components/ExpandableContent';
import ExpandableContentAnimation from '@/Components/ExpandableContentAnimation';
import { ListProvider } from '@/Context/ListContext';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CompareButton from './CompareButton';
import ProposalStatus from './ProposalStatus';

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

    const gradientColors: Record<string, unknown> = {
        complete:
            'from-[var(--success-gradient-color-1)] to-[var(--success-gradient-color-2)]',
        default:
            'from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]',
    };

    const headerBGColor =
        proposal?.status == 'complete'
            ? gradientColors.complete
            : gradientColors.default;

    const contentRef = useRef<HTMLParagraphElement | null>(null);
    const [lineCount, setLineCount] = useState(0);

    const { t } = useTranslation();

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
                className={`text-content-light w-full rounded-xl bg-linear-to-tr ${headerBGColor} flex shrink flex-col ${isHorizontal ? 'h-full' : ''}`}
                data-testid={`proposal-card-header-${proposal?.hash}`}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    {userSelected ? (
                        <div>
                            <Button
                                className="bg-background text-content hover:bg-background absolute top-4 right-4 rounded-lg p-2 transition duration-200 ease-in-out focus:outline-hidden"
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
                            <div className="relative flex items-center space-x-4 pt-16" data-testid="user-profile">
                                <img
                                    src={userSelected?.hero_img_url}
                                    alt={`${userSelected?.name}'s profile`}
                                    className="relative inline-block h-10 w-10 rounded-full ring-2 ring-white"
                                    data-testid="user-profile-image"
                                />
                                <Title level="4">{userSelected?.name}</Title>
                            </div>
                        </div>
                    ) : (
                        <>
                            <ProposalStatus
                                status={proposal.status}
                                funding_status={proposal?.funding_status}
                                data-testid="proposal-status"
                            />
                            <div className="flex items-center">
                                <ListProvider>
                                    {proposal.hash && (
                                        <>
                                            <BookmarkButton
                                                modelType="proposals"
                                                itemId={proposal.hash}
                                                data-testid="bookmark-button"
                                            />
                                        </>
                                    )}
                                </ListProvider>
                                {proposal.hash && (
                                    <CompareButton
                                        model="proposal"
                                        hash={proposal.hash}
                                        tooltipDescription={'Compare Proposals'}
                                        data={proposal}
                                        data-testid="compare-button"
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Card Content */}
                <div
                    className={`min-h-20 p-2 px-4 leading-tight ${
                        !isHorizontal
                            ? ''
                            : 'flex h-full w-full items-center justify-center'
                    }`}
                    style={{ overflow: 'visible' }}
                >
                    <a
                        href={proposal.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:text-primary font-medium ${
                            isHorizontal ? 'mb-4 text-center' : ''
                        }`}
                        style={{ overflow: 'visible' }}
                        data-testid={`single-proposal-card-link-${proposal?.hash}`}
                    >
                        {!userSelected ? (
                            <div ref={contentRef}>
                                <ExpandableContent
                                    className="text-ellipsis"
                                    lineClamp={3}
                                    expanded={isHovered}
                                >
                                    <Title level="4" data-testid={`proposal-card-title-${proposal?.hash}`}>{proposal.title}</Title>
                                </ExpandableContent>
                            </div>
                        ) : null}
                    </a>
                    <div className="flex flex-row justify-end py-0.5 italic" data-testid="proposal-card-fund">
                        <span>~ {proposal.fund?.title}</span>
                    </div>
                </div>
                {!userSelected &&
                    (proposal.ideascale_link ||
                        proposal.projectcatalyst_io_link) && (
                        <nav
                            className="text-content-light flex items-center justify-evenly rounded-b-xl bg-white/25 p-2 font-semibold"
                            aria-label="Related Platforms"
                            data-testid={`related-platforms-proposal-card-links-${proposal?.hash}`}
                        >
                            {proposal.ideascale_link && (
                                <Link
                                    href={proposal.ideascale_link}
                                    className="text-4 text-opacity-100 flex w-full items-center justify-center"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-testid={`ideascale-link-${proposal?.hash}`}
                                >
                                    <span>{t('proposals.ideascale')}</span>
                                </Link>
                            )}
                            {proposal.ideascale_link &&
                                proposal.projectcatalyst_io_link && (
                                    <div className="mx-2 h-3 border-r"></div>
                                )}
                            {proposal.projectcatalyst_io_link && (
                                <Link
                                    href={proposal.projectcatalyst_io_link}
                                    className="text-4 text-opacity-100 flex w-full items-center justify-center"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-testid={`projectcatalyst-link-${proposal?.hash}`}
                                >
                                    <span>
                                        {t('proposals.projectCatalyst')}
                                    </span>
                                </Link>
                            )}
                        </nav>
                    )}
            </header>
        </ExpandableContentAnimation>
    );
}
