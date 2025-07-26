import { shortNumber } from '@/utils/shortNumber';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import ProposalHorizontalCard from './ProposalHorizontalCard';
import ProposalVerticalCard from './ProposalVerticalCard';

type ProposalCardProps = {
    proposal: App.DataTransferObjects.ProposalData;
    isHorizontal: boolean;
    hideFooter?: boolean;
    globalQuickPitchView?: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
};

const ProposalCard = React.memo(
    ({ proposal, isHorizontal, globalQuickPitchView, hideFooter}: ProposalCardProps) => {
        const { t } = useLaravelReactI18n();

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
                hideFooter
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
                hideFooter
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
