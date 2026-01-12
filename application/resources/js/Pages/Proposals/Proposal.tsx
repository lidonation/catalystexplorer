import Button from '@/Components/atoms/Button';
import { ArrowUpRight } from '@/Components/svgs/ArrowUpRight';
import MinusIcon from '@/Components/svgs/MinusIcon';
import PlusIcon from '@/Components/svgs/PlusIcon';
import { ListProvider } from '@/Context/ListContext';
import { generateTabs, proposalTabs } from '@/utils/routeTabs';
import { shortNumber } from '@/utils/shortNumber';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Markdown from 'marked-react';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import BookmarkButton from '../My/Bookmarks/Partials/BookmarkButton';
import ProposalExtendedCard from './Partials/ProposalExtendedCard';
import ProposalTab from './Partials/ProposalTab';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    children: ReactNode;
    proposal: ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
    userCompleteProposalsCount?: number;
    userOutstandingProposalsCount?: number;
    catalystConnectionsCount?: number;
}

const Show = ({
    children,
    proposal,
    globalQuickPitchView,
    userCompleteProposalsCount,
    userOutstandingProposalsCount,
    catalystConnectionsCount,
}: ProposalProps) => {
    const { t } = useLaravelReactI18n();

    const [userSelected, setUserSelected] =
        useState<App.DataTransferObjects.IdeascaleProfileData | null>(null);

    const noSelectedUser = useCallback(() => setUserSelected(null), []);

    const [localQuickPitchView, setLocalQuickPitchView] = useState(false);

    const [activeTab, setActiveTab] = useState('');

    const [isContentExpanded, setIsContentExpanded] = useState(false);

    const hasQuickPitch = useMemo(
        () => Boolean(proposal.quickpitch),
        [proposal.quickpitch],
    );

    const handleUserClick = useCallback(
        (user: App.DataTransferObjects.IdeascaleProfileData) =>
            setUserSelected(user),
        [],
    );

    const tabConfig = useMemo(
        () => ({
            ...proposalTabs,
            routePrefix: `proposals/${proposal.slug}`,
        }),
        [proposal.slug],
    );
    const tabs = useMemo(() => generateTabs(t, tabConfig), [t, tabConfig]);

    useEffect(() => {
        const currentPath = window.location.pathname;

        const matchingTab = tabs.find((tab) => {
            const cleanCurrentPath = currentPath.replace(/\/$/, '');
            const cleanTabPath = tab.href.replace(/\/$/, '');

            return cleanCurrentPath.endsWith(cleanTabPath);
        });

        if (matchingTab) {
            setActiveTab(matchingTab.name);
        }
    }, [tabs]);

    const abstainVotes = useMemo(
        () => shortNumber(proposal?.abstain_votes_count) ?? '(N/A)',
        [proposal?.abstain_votes_count],
    );

    const yesVotes = useMemo(
        () => shortNumber(proposal?.yes_votes_count) ?? '(N/A)',
        [proposal?.yes_votes_count],
    );

    useEffect(() => {
        if (hasQuickPitch) {
            setLocalQuickPitchView(globalQuickPitchView);
        }
    }, [globalQuickPitchView, hasQuickPitch]);

    const toggleLocalQuickPitchView = useCallback(
        (enable: boolean) => {
            if (hasQuickPitch) {
                setLocalQuickPitchView(enable);
            }
        },
        [hasQuickPitch],
    );

    const layoutProps = useMemo(
        () => ({
            proposal,
            userSelected,
            noSelectedUser,
            handleUserClick,
            quickPitchView: localQuickPitchView,
            toggleLocalQuickPitchView,
            t,
            hasQuickPitch,
            yesVotes,
            abstainVotes,
        }),
        [
            proposal,
            userSelected,
            noSelectedUser,
            handleUserClick,
            localQuickPitchView,
            t,
            hasQuickPitch,
            yesVotes,
            abstainVotes,
        ],
    );

    const getMarkdownContent = (
        content: Array<any> | string | null | undefined,
    ): string => {
        if (typeof content === 'string') {
            return content;
        } else if (Array.isArray(content)) {
            return content
                .map((item) => {
                    if (typeof item === 'string') {
                        return item;
                    } else if (typeof item === 'object' && item !== null) {
                        if (item.text) {
                            return item.text;
                        } else if (item.content) {
                            return item.content;
                        } else {
                            return Object.entries(item)
                                .map(([key, value]) => `**${key}**: ${value}`)
                                .join('\n');
                        }
                    }
                    return String(item);
                })
                .join('\n\n');
        }
        return '';
    };

    const toggleContentExpand = () => {
        setIsContentExpanded(!isContentExpanded);
    };

    return (
        <div className="mt-10 flex flex-col gap-4 px-8 sm:px-4 md:px-6 lg:flex-row lg:px-8">
            <Head title={`${proposal.title} - Proposal`} />

            <div className="mx-auto mb-4 w-full md:w-3/4 lg:sticky lg:top-4 lg:mx-0 lg:w-1/3 lg:self-start xl:w-1/4">
                <ProposalExtendedCard {...layoutProps} />
            </div>

            <div className="relative z-0 flex w-full flex-col lg:w-2/3 xl:w-3/4">
                <div className="mb-4 flex flex-col-reverse items-center justify-between sm:flex-row">
                    <section className="text-content-lighter relative z-0 mt-4 w-full flex-grow overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-0 [&::-webkit-scrollbar]:hidden">
                        <ProposalTab tabs={tabs} activeTab={activeTab} />
                    </section>
                    <div className="bg-background flex flex-shrink-0 items-center justify-center gap-1 self-end  rounded-lg px-3 py-1 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] sm:ml-2 sm:self-auto">
                        <ListProvider>
                            {proposal.id && (
                                <>
                                    <BookmarkButton
                                        modelType="proposals"
                                        itemId={proposal.id}
                                    >
                                        <span>{t('buttons.bookmark')}</span>
                                    </BookmarkButton>
                                </>
                            )}
                        </ListProvider>
                    </div>
                </div>

                <section>{children}</section>

                <div className="bg-background shadow-cx-box-shadow flex flex-col items-start justify-between gap-5 self-stretch rounded-xl p-4 sm:flex-row sm:gap-2 sm:p-6">
                    <div className="flex w-full flex-wrap items-center gap-6 sm:w-auto sm:gap-4">
                        <div className="flex min-w-[30%] flex-1 flex-col items-start sm:min-w-0 sm:flex-initial">
                            <div className="text-gray-persist text-sm">
                                {t('proposals.outstanding')}
                            </div>
                            <div className="text-content text-base">
                                {userOutstandingProposalsCount && userOutstandingProposalsCount > 0 ? userOutstandingProposalsCount : '-'}
                            </div>
                        </div>
                        <div className="flex min-w-[30%] flex-1 flex-col items-start sm:min-w-0 sm:flex-initial">
                            <div className="text-gray-persist text-sm">
                                {t('proposals.completed')}
                            </div>
                            <div className="text-content text-base">
                                {userCompleteProposalsCount && userCompleteProposalsCount > 0 ? userCompleteProposalsCount : '-'}
                            </div>
                        </div>
                        <div className="flex min-w-[30%] flex-1 flex-col items-start sm:min-w-0 sm:flex-initial">
                            <div className="text-gray-persist text-sm">
                                {t('proposals.catalystConnection')}
                            </div>
                            <div className="text-content text-base">
                                {catalystConnectionsCount && catalystConnectionsCount > 0 ? catalystConnectionsCount : '-'}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full items-center justify-center sm:w-auto sm:justify-end">
                        <Button className="from-background-home-gradient-color-1 to-background-home-gradient-color-2 flex w-44 items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-t px-4 py-2.5">
                            <div className="flex items-center justify-center px-0.5">
                                <div className="text-sm text-white">
                                    {t('proposals.tabs.team')}
                                </div>
                                <ArrowUpRight />
                            </div>
                        </Button>
                    </div>
                </div>

                <div className="bg-background shadow-cx-box-shadow relative mt-4 mb-4 flex flex-col items-start gap-4 self-stretch rounded-xl p-6">
                    <div className="flex w-full justify-end">
                        <Button
                            onClick={toggleContentExpand}
                            className="rounded-full p-2"
                            aria-label={
                                isContentExpanded
                                    ? t('common.collapse')
                                    : t('common.expand')
                            }
                        >
                            {isContentExpanded ? <MinusIcon /> : <PlusIcon />}
                        </Button>
                    </div>

                    <div
                        className={`w-full overflow-hidden transition-all duration-300 ${isContentExpanded ? 'max-h-full' : 'max-h-140'}`}
                    >
                        <Markdown>
                            {getMarkdownContent(proposal.content)}
                        </Markdown>
                    </div>

                    {!isContentExpanded && (
                        <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t to-transparent" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Show;
