import { db } from '@/db/db';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { usePage } from '@inertiajs/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookmarkCheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import NavLinkItem from '../atoms/NavLinkItem';
import ModalNavLink from '../ModalNavLink';
import ArrowDownIcon from '../svgs/ArrowDownIcon';
import ArrowUpIcon from '../svgs/ArrowUpIcon';
import BarLineIcon from '../svgs/BarLineIcon';
import CheckIcon from '../svgs/CheckIcon';
import CommunitiesIcon from '../svgs/CommunitiesSvg';
import CompareIcon from '../svgs/CompareIcon';
import CompletedProjectNftsIcon from '../svgs/CompletedProjectNftsIcon';
import ConnectionsIcon from '../svgs/ConnectionsIcon';
import DrepIcon from '../svgs/DrepIcon';
import HomeIcon from '../svgs/HomeIcon';
import MoreIcon from '../svgs/MoreIcon';
import NoteIcon from '../svgs/NoteIcon';
import NumbersIcon from '../svgs/NumbersIcon';
import PeopleIcon from '../svgs/PeopleIcon';

function AppNavigation() {
    const { t } = useTranslation();
    const { url } = usePage();
    const [jormungandrOpen, setJormungandrOpen] = useState(false);
    const [numbersOpen, setNumbersOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const isOnMyRoute = url.includes('/my/');

    const stripLanguagePrefix = (path?: string) => {
        if (!path) return '';

        const isAbsoluteUrl =
            path.startsWith('http://') || path.startsWith('https://');
        const parsedPath = isAbsoluteUrl ? new URL(path).pathname : path;
        const normalizedPath = parsedPath.replace(/^\/(en|fr|sw)(\/|$)/, '/');
        const basePath = normalizedPath.split('?')[0];
        return basePath.endsWith('/') && basePath !== '/'
            ? basePath.slice(0, -1)
            : basePath;
    };

    const normalizedUrl = stripLanguagePrefix(url);

    const navItems = [
        {
            href: useLocalizedRoute('home'),
            title: t('home'),
            icon: (isActive: boolean) => (
                <HomeIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('proposals.index'),
            title: t('proposals.proposals'),
            icon: (isActive: boolean) => (
                <NoteIcon
                    width={24}
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('funds.index'),
            title: t('funds.funds'),
            icon: (isActive: boolean) => (
                <CheckIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hideOnMyRoute: true,
        },
        {
            href: useLocalizedRoute('ideascaleProfiles.index'),
            title: t('ideascaleProfiles.ideascaleProfiles'),
            icon: (isActive: boolean) => (
                <PeopleIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hideOnMyRoute: true,
        },
        {
            title: t('numbers'),
            icon: (isActive: boolean) => (
                <NumbersIcon
                    width={20}
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hasDropdown: true,
            hideOnMyRoute: true,
        },
        {
            title: t('jormungandr'),
            icon: (isActive: boolean) => (
                <BarLineIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hasDropdown: true,
            hideOnMyRoute: true,
        },
        {
            href: useLocalizedRoute('connections.index'),
            title: t('connections'),
            icon: (isActive: boolean) => (
                <ConnectionsIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hideOnMyRoute: true,
            disable: true,
        },
        {
            href: useLocalizedRoute('communities.index'),
            title: t('communities.communities'),
            icon: (isActive: boolean) => (
                <CommunitiesIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hideOnMyRoute: true,
        },
        {
            href: useLocalizedRoute('groups.index'),
            title: t('groups.groups'),
            icon: (isActive: boolean) => (
                <CheckIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hideOnMyRoute: true,
        },
        {
            href: useLocalizedRoute('milestones.index'),
            title: t('milestones.milestones'),
            icon: (isActive: boolean) => (
                <PeopleIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hideOnMyRoute: true,
            disable: true,
        },
        {
            href: useLocalizedRoute('dreps.index'),
            title: t('Dreps'),
            icon: (isActive: boolean) => (
                <DrepIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hideOnMyRoute: true,
        },
        {
            href: useLocalizedRoute('lists.index'),
            title: t('listsAndBookmarks'),
            icon: (isActive: boolean) => (
                <BookmarkCheckIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hideOnMyRoute: true,
        },
        {
            href: useLocalizedRoute('completedProjectsNfts.index'),
            title: t('completedProjectNfts.title'),
            icon: (isActive: boolean) => (
                <CompletedProjectNftsIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hasIndicator: true,
            hideOnMyRoute: true,
        },
        {
            title: t('More'),
            icon: (isActive: boolean) => (
                <MoreIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hasDropdown: true,
            hideOnMyRoute: true,
        },
    ];

    const filteredNavItems = navItems.filter((item) => {
        if (isOnMyRoute && item.hideOnMyRoute) {
            return false;
        }
        return true;
    });

    return (
        <nav className="flex h-auto flex-col justify-between" role="menu">
            <ul className="menu-gap-y flex flex-1 flex-col px-4" role="menu">
                {filteredNavItems.map(
                    ({
                        href,
                        title,
                        icon,
                        hasDropdown,
                        hasIndicator,
                        disable,
                    }) => {
                        const normalizedHref = href
                            ? stripLanguagePrefix(href)
                            : '';
                        const isActive = normalizedUrl === normalizedHref;
                        const isJormungandr = title === t('jormungandr');
                        const isNumbers = title === t('numbers');
                        const isMore = title === t('More');
                        const isProposals = title === t('proposals.proposals');

                        if (hasIndicator) {
                            return (
                                <li key={href} className="relative">
                                    <div className="flex items-center justify-between">
                                        <NavLinkItem
                                            ariaLabel={`${title} ${t('link')}`}
                                            href={href || '#'}
                                            title={title}
                                            active={isActive}
                                            prefetch
                                            async
                                        >
                                            {icon(isActive)}
                                        </NavLinkItem>
                                        <div className="bg-success mr-2 size-2 rounded-full"></div>
                                    </div>
                                </li>
                            );
                        }

                        if (isJormungandr) {
                            return (
                                <li key={title}>
                                    <div>
                                        <div
                                            className={`text-dark hover:bg-background-lighter flex cursor-pointer items-center justify-between px-3 py-1 text-sm transition-colors`}
                                            onClick={() =>
                                                setJormungandrOpen(
                                                    !jormungandrOpen,
                                                )
                                            }
                                            role="button"
                                            aria-expanded={jormungandrOpen}
                                            aria-label={`${title} ${t('dropdown')}`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-3">
                                                    <BarLineIcon
                                                        width={20}
                                                        className="text-dark"
                                                    />
                                                </span>
                                                <span>{title}</span>
                                            </div>
                                            {jormungandrOpen ? (
                                                <ArrowUpIcon
                                                    height={10}
                                                    width={10}
                                                />
                                            ) : (
                                                <ArrowDownIcon
                                                    height={10}
                                                    width={10}
                                                />
                                            )}
                                        </div>

                                        {jormungandrOpen && (
                                            <div className="bg-background ml-10">
                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'jormungandr.transactions.index',
                                                    )}
                                                    title={t('Transactions')}
                                                    ariaLabel={`${t('transactions.title')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>

                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'jormungandr.votes.index',
                                                    )}
                                                    title={t('Votes')}
                                                    ariaLabel={`${t('votes')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>

                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'jormungandr.voters.index',
                                                    )}
                                                    title={t('Voters')}
                                                    ariaLabel={`${t('voters')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        }

                        if (isNumbers) {
                            return (
                                <li key={title}>
                                    <div>
                                        <div
                                            className="text-dark hover:bg-background-lighter flex cursor-pointer items-center justify-between px-3 py-1 text-sm transition-colors"
                                            onClick={() =>
                                                setNumbersOpen(!numbersOpen)
                                            }
                                            role="button"
                                            aria-expanded={numbersOpen}
                                            aria-label={`${title} ${t('dropdown')}`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-3">
                                                    <NumbersIcon
                                                        width={20}
                                                        className="text-dark"
                                                    />
                                                </span>
                                                <span>{title}</span>
                                            </div>
                                            {numbersOpen ? (
                                                <ArrowUpIcon
                                                    height={10}
                                                    width={10}
                                                />
                                            ) : (
                                                <ArrowDownIcon
                                                    height={10}
                                                    width={10}
                                                />
                                            )}
                                        </div>

                                        {numbersOpen && (
                                            <div className="bg-background ml-10">
                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'numbers.impact',
                                                    )}
                                                    disable={true}
                                                    title={t('Impact')}
                                                    ariaLabel={`${t('impact')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>

                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'numbers.spending',
                                                    )}
                                                    disable={true}
                                                    title={t('Spending')}
                                                    ariaLabel={`${t('spending')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>

                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'numbers.general',
                                                    )}
                                                    disable={true}
                                                    title={t('General')}
                                                    ariaLabel={`${t('general')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        }

                        if (isMore) {
                            return (
                                <li key={title}>
                                    <div>
                                        <div
                                            className="text-dark hover:bg-background-lighter flex cursor-pointer items-center justify-between px-3 py-1 text-sm transition-colors"
                                            onClick={() =>
                                                setMoreOpen(!moreOpen)
                                            }
                                            role="button"
                                            aria-expanded={moreOpen}
                                            aria-label={`${title} ${t('dropdown')}`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-3">
                                                    <MoreIcon
                                                        width={20}
                                                        className="text-dark"
                                                    />
                                                </span>
                                                <span>{title}</span>
                                            </div>
                                            {moreOpen ? (
                                                <ArrowUpIcon
                                                    height={10}
                                                    width={10}
                                                />
                                            ) : (
                                                <ArrowDownIcon
                                                    height={10}
                                                    width={10}
                                                />
                                            )}
                                        </div>

                                        {moreOpen && (
                                            <div className="bg-background rounded-md pl-10">
                                                <NavLinkItem
                                                    href={route('api.index')}
                                                    disable={true}
                                                    title="API"
                                                    ariaLabel={`${t('API')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>

                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'reviews.index',
                                                    )}
                                                    title="Proposal Reviews"
                                                    ariaLabel={`${t('proposalReviews')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>

                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'reviewers.index',
                                                    )}
                                                    disable={true}
                                                    title="Reviewers"
                                                    ariaLabel={`${t('reviewers')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>

                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'reports.index',
                                                    )}
                                                    disable={true}
                                                    title="Monthly Reports"
                                                    ariaLabel={`${t('monthlyReports')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>

                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'proposals.csvs',
                                                    )}
                                                    disable={true}
                                                    title="Proposal CSVs"
                                                    ariaLabel={`${t('CSVs')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>

                                                <NavLinkItem
                                                    href={useLocalizedRoute(
                                                        'ccv4.index',
                                                    )}
                                                    disable={true}
                                                    title="CCV4 Votes"
                                                    ariaLabel={`${t('ccV4Votes')} ${t('link')}`}
                                                    active={false}
                                                ></NavLinkItem>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        }

                        if (isProposals) {
                            const comparisonCount = useLiveQuery(async () => {
                                const allSettings =
                                    await db.user_setting.toArray();

                                const allProposalComparisons = allSettings
                                    .map((s) => s.proposalComparison)
                                    .filter(Boolean);

                                return allProposalComparisons[0]?.length ?? 0;
                            }, []);

                            if (comparisonCount === undefined) return null;

                            return (
                                <li
                                    key={href}
                                    className="relative flex items-center"
                                >
                                    <NavLinkItem
                                        ariaLabel={`${title} ${t('link')}`}
                                        href={href || '#'}
                                        title={title}
                                        active={isActive}
                                        prefetch
                                        async
                                    >
                                        {icon(isActive)}
                                    </NavLinkItem>
                                    <ModalNavLink
                                        href="#proposal-comparison"
                                        className="border-primary-mid bg-primary-light absolute right-0 flex min-w-[2em] items-center justify-center gap-2 rounded-full border px-2 py-0 hover:cursor-pointer"
                                    >
                                        <CompareIcon width={20} primary />
                                        <span className="text-primary text-sm">
                                            {comparisonCount}
                                        </span>
                                    </ModalNavLink>
                                </li>
                            );
                        }

                        return (
                            <li key={href}>
                                <NavLinkItem
                                    disable={disable}
                                    ariaLabel={`${title} ${t('link')}`}
                                    href={href || '#'}
                                    title={title}
                                    active={isActive}
                                    prefetch
                                    async
                                >
                                    {icon(isActive)}
                                </NavLinkItem>
                            </li>
                        );
                    },
                )}
            </ul>
        </nav>
    );
}

export default AppNavigation;
