import { shortNumber } from '@/utils/shortNumber';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProposalHorizontalCard from './ProposalHorizontalCard';
import ProposalVerticalCard from './ProposalVerticalCard';

type ProposalCardProps = {
    proposal: App.DataTransferObjects.ProposalData;
    isHorizontal: boolean;
    globalQuickPitchView?: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
};

const ProposalCard = React.memo(
    ({ proposal, isHorizontal, globalQuickPitchView }: ProposalCardProps) => {
        const { t } = useTranslation();

        const [userSelected, setUserSelected] =
            useState<App.DataTransferObjects.IdeascaleProfileData | null>(null);

        const hasQuickPitch = useMemo(
            () => Boolean(proposal.quickpitch),
            [proposal.quickpitch],
        );

        const handleUserClick = useCallback(
            (user: App.DataTransferObjects.IdeascaleProfileData) =>
                setUserSelected(user),
            [],
        );

        const noSelectedUser = useCallback(() => setUserSelected(null), []);

        const abstainVotes = useMemo(
            () => shortNumber(proposal?.abstain_votes_count) ?? '(N/A)',
            [proposal?.abstain_votes_count],
        );

        const yesVotes = useMemo(
            () => shortNumber(proposal?.yes_votes_count) ?? '(N/A)',
            [proposal?.yes_votes_count],
        );

        const [localQuickPitchView, setLocalQuickPitchView] = useState(false);

        // Sync local state with global state if the proposal has a quick pitch
        useEffect(() => {
            if (hasQuickPitch) {
                setLocalQuickPitchView(globalQuickPitchView ?? false);
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
                isHorizontal,
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
                isHorizontal,
                t,
                hasQuickPitch,
                yesVotes,
                abstainVotes,
            ],
        );

        return isHorizontal ? (
            <ProposalHorizontalCard {...layoutProps} />
        ) : (
            <ProposalVerticalCard {...layoutProps} />
        );
    },
);

export default ProposalCard;
