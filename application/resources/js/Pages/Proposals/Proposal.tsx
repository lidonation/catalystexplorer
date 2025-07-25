import ProposalExtendedCard from "./Partials/ProposalExtendedCard";
import ProposalData = App.DataTransferObjects.ProposalData;
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { shortNumber } from "@/utils/shortNumber";
import { generateTabs, proposalTabs } from '@/utils/routeTabs';
import {useLaravelReactI18n} from "laravel-react-i18n";
import ProposalTab from "./Partials/ProposalTab";
import { ListProvider } from "@/Context/ListContext";
import BookmarkButton from "../My/Bookmarks/Partials/BookmarkButton";
import Paragraph from "@/Components/atoms/Paragraph";
import { ArrowUpRight } from "@/Components/svgs/ArrowUpRight";
import Markdown from "marked-react";
import Button from "@/Components/atoms/Button";
import PlusIcon from "@/Components/svgs/PlusIcon";
import MinusIcon from "@/Components/svgs/MinusIcon";
import { Head } from "@inertiajs/react";

interface ProposalProps {
    children: ReactNode;
    proposal: ProposalData,
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
        catalystConnectionsCount
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
            [proposal, userSelected, noSelectedUser, handleUserClick, localQuickPitchView, t, hasQuickPitch, yesVotes, abstainVotes],
        );

        const getMarkdownContent = (content: Array<any> | string | null | undefined): string => {
            if (typeof content === 'string') {
                return content;
            } else if (Array.isArray(content)) {
                return content.map(item => {
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
                }).join('\n\n');
            }
            return '';
        };

        const toggleContentExpand = () => {
            setIsContentExpanded(!isContentExpanded);
        };

    return (
        <div className="mt-10 flex flex-col gap-4 px-8 sm:px-4 md:px-6 lg:flex-row lg:px-8">
            <Head title={`${proposal.title} - Proposal`} />

            <div className="mx-auto w-full md:w-3/4 lg:sticky lg:top-4 lg:mx-0 lg:w-1/3 lg:self-start xl:w-1/4 mb-4">
                <ProposalExtendedCard {...layoutProps} />
            </div>

            <div className="relative z-0 flex w-full flex-col lg:w-2/3 xl:w-3/4">
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center mb-4">
                    <section className="text-content-lighter relative z-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-grow w-full mt-4 sm:mt-0">
                        <ProposalTab tabs={tabs} activeTab={activeTab} />
                    </section>
                    <div className="px-3 py-1 bg-background rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] flex-shrink-0 flex items-center justify-center gap-1 overflow-hidden self-end sm:self-auto sm:ml-2">
                        <ListProvider>
                            {proposal.hash && (
                                <>
                                    <Paragraph>{t('buttons.bookmark')}</Paragraph>
                                    <BookmarkButton
                                        modelType="proposals"
                                        itemId={proposal.hash}
                                    />
                                </>
                            )}
                        </ListProvider>
                    </div>
                </div>

                <section>{children}</section>

                <div className="self-stretch p-4 sm:p-6 bg-background rounded-xl shadow-[0px_1px_4px_0px_rgba(16,24,40,0.10)] flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-2">
                    <div className="w-full sm:w-auto flex flex-wrap items-center gap-6 sm:gap-4">
                        <div className="flex-1 sm:flex-initial min-w-[30%] sm:min-w-0 flex flex-col items-start">
                            <div className="text-gray-persist text-sm">{t('proposals.outstanding')}</div>
                            <div className="text-content text-base">{userOutstandingProposalsCount}</div>
                        </div>
                        <div className="flex-1 sm:flex-initial min-w-[30%] sm:min-w-0 flex flex-col items-start">
                            <div className="text-gray-persist text-sm">{t('proposals.completed')}</div>
                            <div className="text-content text-base">{userCompleteProposalsCount}</div>
                        </div>
                        <div className="flex-1 sm:flex-initial min-w-[30%] sm:min-w-0 flex flex-col items-start">
                            <div className="text-gray-persist text-sm">{t('proposals.catalystConnection')}</div>
                            <div className="text-content text-base">{catalystConnectionsCount}</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto">
                        <Button className="w-44 px-4 py-2.5 bg-gradient-to-t from-background-home-gradient-color-1 to-background-home-gradient-color-2 rounded-lg flex justify-center items-center gap-1.5 overflow-hidden">
                            <div className="px-0.5 flex justify-center items-center">
                                <div className="text-white text-sm">{t('proposals.tabs.team')}</div>
                                <ArrowUpRight/>
                            </div>
                        </Button>
                    </div>
                </div>

                <div className="self-stretch p-6 bg-background rounded-xl shadow-[0px_1px_4px_0px_rgba(16,24,40,0.10)] flex flex-col items-start gap-4 mt-4 mb-4 relative">
                    <div className='w-full flex justify-end'>
                        <Button
                            onClick={toggleContentExpand}
                            className="p-2 rounded-full"
                            aria-label={isContentExpanded ? t('common.collapse') : t('common.expand')}
                        >
                            {isContentExpanded ? <MinusIcon /> : <PlusIcon />}
                        </Button>
                    </div>

                    <div className={`w-full overflow-hidden transition-all duration-300 ${isContentExpanded ? 'max-h-full' : 'max-h-140'}`}>
                        <Markdown>
                            {getMarkdownContent(proposal.content)}
                        </Markdown>
                    </div>

                    {!isContentExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Show;
