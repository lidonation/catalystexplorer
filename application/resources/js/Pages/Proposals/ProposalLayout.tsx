import { ListProvider } from '@/Context/ListContext';
import { generateTabs, proposalTabs } from '@/utils/routeTabs';
import { shortNumber } from '@/utils/shortNumber';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import BookmarkButton from '../My/Bookmarks/Partials/BookmarkButton';
import ProposalExtendedCard from './Partials/ProposalExtendedCard';
import ProposalTab from './Partials/ProposalTab';

interface ProposalLayoutProps {
    children: ReactNode;
    proposal: App.DataTransferObjects.ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
    ogMeta?: {
        ogImageUrl: string;
        proposalUrl: string;
        description: string;
    };
}

const ProposalLayout = ({
    children,
    proposal,
    globalQuickPitchView,
    ogMeta,
}: ProposalLayoutProps) => {
    const { t } = useLaravelReactI18n();

    // Use server-side OG meta data if available (for SSR), otherwise construct client-side
    const ogImageUrl = ogMeta?.ogImageUrl ??
        (typeof window !== 'undefined' ? `${window.location.origin}/og-image/proposals/${proposal.slug}` : '');
    const proposalUrl = ogMeta?.proposalUrl ??
        (typeof window !== 'undefined' ? window.location.href : '');
    const description = (ogMeta?.description ?? proposal.social_excerpt )|| proposal.excerpt || proposal.title || '';

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
        // Skip during SSR
        if (typeof window === 'undefined') return;

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

    return (
        <div className="mt-10 flex flex-col gap-4 px-8 sm:px-4 md:px-6 lg:flex-row lg:px-8">
            <div className="mt-7 mb-4 w-full md:w-3/4 lg:sticky lg:top-4 lg:mx-0 lg:w-1/3 lg:self-start xl:w-1/4">
                <ProposalExtendedCard {...layoutProps} />
            </div>

            <div className="relative z-0 flex w-full flex-col lg:w-2/3 xl:w-3/4">
                <div className="mb-4 flex flex-col-reverse justify-between sm:flex-row">
                    <section className="text-content-lighter relative z-0 mt-4 w-full flex-grow overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-0 [&::-webkit-scrollbar]:hidden">
                        <ProposalTab tabs={tabs} activeTab={activeTab} />
                    </section>
                    <div className="bg-background inline-flex flex-shrink-0 items-center justify-center self-end overflow-hidden rounded-lg p-2 shadow-md sm:ml-2">
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
