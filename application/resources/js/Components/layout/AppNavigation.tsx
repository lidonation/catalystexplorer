import { useLocalizedRoute } from '@/utils/localizedRoute';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import NavLinkItem from '../atoms/NavLinkItem';
import BarLineIcon from '../svgs/BarLineIcon';
import CheckIcon from '../svgs/CheckIcon';
import CommunitiesIcon from '../svgs/CommunitiesSvg';
import ConnectionsIcon from '../svgs/ConnectionsIcon';
import HomeIcon from '../svgs/HomeIcon';
import NumbersIcon from '../svgs/NumbersIcon';
import NoteIcon from '../svgs/NoteIcon';
import PeopleIcon from '../svgs/PeopleIcon';
import DrepIcon from '../svgs/DrepIcon';
import { BookmarkCheckIcon } from 'lucide-react';
import CompletedProjectNftsIcon from '../svgs/CompletedProjectNftsIcon';
import MoreIcon from '../svgs/MoreIcon';
import Button from '../atoms/Button';
import ArrowDownIcon from '../svgs/ArrowDownIcon';
import ArrowUpIcon from '../svgs/ArrowUpIcon';

function AppNavigation() {
    const { t } = useTranslation();
    const { url } = usePage();
    const [jormungandrOpen, setJormungandrOpen] = useState(false);
    const [numbersOpen, setNumbersOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);

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
        },
        {
            href: useLocalizedRoute('ideascaleProfiles.index'),
            title: t('ideascaleProfiles.ideascaleProfiles'),
            icon: (isActive: boolean) => (
                <PeopleIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            title: t('numbers'),
            icon: (isActive: boolean) => (
                <NumbersIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hasDropdown: true,
        },
        {
            title: t('jormungandr'),
            icon: (isActive: boolean) => (
                <BarLineIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hasDropdown: true,
        },
        {
            href: useLocalizedRoute('connections.index'),
            title: t('connections'),
            icon: (isActive: boolean) => (
                <ConnectionsIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('communities.index'),
            title: t('communities.communities'),
            icon: (isActive: boolean) => (
                <CommunitiesIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('groups.index'),
            title: t('groups.groups'),
            icon: (isActive: boolean) => (
                <CheckIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('dreps.index'),
            title: t('Dreps'),
            icon: (isActive: boolean) => (
                <DrepIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('bookmarks.index'),
            title: t('listsAndBookmarks'),
            icon: (isActive: boolean) => (
                <BookmarkCheckIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
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
        },
        {
            title: t('More'),
            icon: (isActive: boolean) => (
                <MoreIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
            hasDropdown: true,
        },
    ];

    return (
        <nav className="flex flex-col justify-between" role="menu">
            <ul className="menu-gap-y flex flex-1 flex-col px-4" role="menu">
                {navItems.map(({ href, title, icon, hasDropdown, hasIndicator }) => {
                    const normalizedHref = href ? stripLanguagePrefix(href) : '';
                    const isActive = normalizedUrl === normalizedHref;
                    const isJormungandr = title === t('jormungandr');
                    const isNumbers = title === t('numbers');
                    const isMore = title === t('More');

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
                                    <div className="size-2 rounded-full bg-success mr-2"></div>
                                </div>
                            </li>
                        );
                    }

                    if (isJormungandr) {
                        return (
                            <li key={title}>
                                <div>
                                    <div 
                                        className="flex items-center justify-between px-3 py-1 cursor-pointer text-sm text-dark transition-colors hover:bg-background-lighter"
                                        onClick={() => setJormungandrOpen(!jormungandrOpen)}
                                        role="button"
                                        aria-expanded={jormungandrOpen}
                                        aria-label={`${title} ${t('dropdown')}`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">
                                                <BarLineIcon className="text-dark" />
                                            </span>
                                            <span>{title}</span>
                                        </div>
                                        {jormungandrOpen ? (
                                            <ArrowUpIcon height={10} width={10} />
                                        ) : (
                                            <ArrowDownIcon height={10} width={10} />
                                        )}
                                    </div>

                                    {jormungandrOpen && (
                                        <div className="pl-8 bg-background rounded">
                                            <NavLinkItem
                                                href={useLocalizedRoute('jormungandr.transactions.index')}
                                                title={t('Transactions')}
                                                ariaLabel={`${t('transactions.title')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href="#"
                                                title={t('Votes')}
                                                ariaLabel={`${t('votes')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href="#"
                                                title={t('Voters')}
                                                ariaLabel={`${t('voters')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>
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
                                        className="flex items-center justify-between px-3 py-1 cursor-pointer text-sm text-dark transition-colors hover:bg-background-lighter"
                                        onClick={() => setNumbersOpen(!numbersOpen)}
                                        role="button"
                                        aria-expanded={numbersOpen}
                                        aria-label={`${title} ${t('dropdown')}`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">
                                                <NumbersIcon className="text-dark" />
                                            </span>
                                            <span>{title}</span>
                                        </div>
                                        {numbersOpen ? (
                                            <ArrowUpIcon height={10} width={10} />
                                        ) : (
                                            <ArrowDownIcon height={10} width={10} />
                                        )}
                                    </div>

                                    {numbersOpen && (
                                        <div className="pl-8 bg-background rounded">
                                            <NavLinkItem
                                                href="#"
                                                title={t('Impact')}
                                                ariaLabel={`${t('impact')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href="#"
                                                title={t('Spending')}
                                                ariaLabel={`${t('spending')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href="#"
                                                title={t('General')}
                                                ariaLabel={`${t('general')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>
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
                                        className="flex items-center justify-between px-3 py-1 cursor-pointer text-sm text-dark transition-colors hover:bg-background-lighter"
                                        onClick={() => setMoreOpen(!moreOpen)}
                                        role="button"
                                        aria-expanded={moreOpen}
                                        aria-label={`${title} ${t('dropdown')}`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">
                                                <MoreIcon className="text-dark" />
                                            </span>
                                            <span>{title}</span>
                                        </div>
                                        {moreOpen ? (
                                            <ArrowUpIcon height={10} width={10} />
                                        ) : (
                                            <ArrowDownIcon height={10} width={10} />
                                        )}
                                    </div>

                                    {moreOpen && (
                                        <div className="pl-8 bg-background shadow-md rounded-md">
                                            <NavLinkItem
                                                href="#"
                                                title="API"
                                                ariaLabel={`${t('API')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href={useLocalizedRoute('reviews.index')}
                                                title="Proposal Reviews"
                                                ariaLabel={`${t('proposalReviews')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href="#"
                                                title="Reviewers"
                                                ariaLabel={`${t('reviewers')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href="#"
                                                title="Milestones"
                                                ariaLabel={`${t('milestones')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href="#"
                                                title="Monthly Reports"
                                                ariaLabel={`${t('monthlyReports')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href="#"
                                                title="Proposal CSVs"
                                                ariaLabel={`${t('CSVs')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href="#"
                                                title="CCV4 Votes"
                                                ariaLabel={`${t('ccV4Votes')} ${t('link')}`}
                                                active={false}
                                            >
                                                <span></span>
                                            </NavLinkItem>
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    }

                    return (
                        <li key={href}>
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
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default AppNavigation;
