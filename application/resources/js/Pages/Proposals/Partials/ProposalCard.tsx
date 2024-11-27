import { useState, useEffect } from 'react';
import { shortNumber } from '@/utils/shortNumber';
import { useTranslation } from 'react-i18next';
import ProposalHorizontalCard from './ProposalHorizontalCard';
import ProposalVerticalCard from './ProposalVerticalCard';

type ProposalCardProps = {
    proposal: App.DataTransferObjects.ProposalData;
    isHorizontal: boolean;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
};


export default function ProposalCard({
    proposal,
    isHorizontal,
    globalQuickPitchView,
    setGlobalQuickPitchView,
}: ProposalCardProps) {
    const { t } = useTranslation();

    const [userSelected, setUserSelected] = useState<App.DataTransferObjects.IdeascaleProfileData | null>(null);

    const hasQuickPitch = Boolean(proposal.quickpitch);

    const handleUserClick = (user: App.DataTransferObjects.IdeascaleProfileData) => setUserSelected(user);
    const noSelectedUser = () => setUserSelected(null);

    const abstainVotes = shortNumber(proposal?.abstain_votes_count) ?? '(N/A)';
    const yesVotes = shortNumber(proposal?.yes_votes_count) ?? '(N/A)';

    const [localQuickPitchView, setLocalQuickPitchView] = useState(false);

    // Sync local state with global state if the proposal has a quick pitch
    useEffect(() => {
        if (hasQuickPitch) {
            setLocalQuickPitchView(globalQuickPitchView);
        }
    }, [globalQuickPitchView, hasQuickPitch]);

    const toggleLocalQuickPitchView = (enable: boolean) => {
        if (hasQuickPitch) {
            setLocalQuickPitchView(enable);
        }
    };
    const quickPitchView = localQuickPitchView;

    const layoutProps = {
        proposal,
        userSelected,
        noSelectedUser,
        handleUserClick,
        quickPitchView,
        toggleLocalQuickPitchView,
        isHorizontal,
        t,
        hasQuickPitch,
        yesVotes,
        abstainVotes,
    };

    return isHorizontal ? (
        <ProposalHorizontalCard {...layoutProps} />
    ) : (
        <ProposalVerticalCard {...layoutProps} />
    );
}
