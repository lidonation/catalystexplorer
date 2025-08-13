import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {useLaravelReactI18n} from "laravel-react-i18n";
import { Head } from "@inertiajs/react";
import { shortNumber } from "@/utils/shortNumber";
import { generateTabs, proposalTabs } from '@/utils/routeTabs';
import { ListProvider } from "@/Context/ListContext";
import ProposalExtendedCard from "./Partials/ProposalExtendedCard";
import ProposalTab from "./Partials/ProposalTab";
import BookmarkButton from "../My/Bookmarks/Partials/BookmarkButton";
import Paragraph from "@/Components/atoms/Paragraph";

interface ProposalLayoutProps {
    children: ReactNode;
    proposal: App.DataTransferObjects.ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
}

const ProposalLayout = ({
    children,
    proposal,
    globalQuickPitchView,
}: ProposalLayoutProps) => {
    const { t } = useLaravelReactI18n();

    const [userSelected, setUserSelected] =
        useState<App.DataTransferObjects.IdeascaleProfileData | null>(null);

    const noSelectedUser = useCallback(() => setUserSelected(null), []);

    const [localQuickPitchView, setLocalQuickPitchView] = useState(false);

    const [activeTab, setActiveTab] = useState('');

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

    return (
        <div className="mt-10 flex flex-col gap-4 px-8 sm:px-4 md:px-6 lg:flex-row lg:px-8">
            <Head title={`${proposal.title} - Proposal`} />

            <div className="mt-7 w-full md:w-3/4 lg:sticky lg:top-4 lg:mx-0 lg:w-1/3 lg:self-start xl:w-1/4 mb-4">
                <ProposalExtendedCard {...layoutProps} />
            </div>

            <div className="relative z-0 flex w-full flex-col lg:w-2/3 xl:w-3/4">
                <div className="flex flex-col-reverse sm:flex-row justify-between mb-4">
                    <section className="text-content-lighter relative z-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-grow w-full mt-4 sm:mt-0">
                        <ProposalTab tabs={tabs} activeTab={activeTab} />
                    </section>
                    <div className="p-2 bg-background rounded-lg shadow-md flex-shrink-0 inline-flex items-center justify-center overflow-hidden self-end sm:ml-2">
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

                {children}
            </div>
        </div>
    );
};

export default ProposalLayout;
