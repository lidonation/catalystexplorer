declare namespace App.ShareCard {
    export type VisibleElement =
        | 'myVote'
        | 'logo'
        | 'totalVotes'
        | 'campaignTitle'
        | 'openSourceBadge';


    export type OgTheme = {
        id: string;
        name: string;
        gradientStart: string;
        gradientEnd: string;
        preview: string; // Thumbnail URL or gradient CSS
    };

    export type VoteChoice = 'yes' | 'no' | 'abstain' | null;

    export interface ConfiguratorState {
        visibleElements: VisibleElement[];
        selectedThemeId: string;
        customColor: string | null;
        customMessage: string;
        callToActionText: string;
        logoUrl: string | null;
    }

    export interface OgPreviewCardProps {
        proposal: App.DataTransferObjects.ProposalData;
        config: ConfiguratorState;
        voteChoice?: VoteChoice;
    }

    export interface ShareCardConfiguratorProps {
        proposal: App.DataTransferObjects.ProposalData;
        initialConfig?: Partial<ConfiguratorState>;
        voteChoice?: VoteChoice;
        onSave?: (config: ConfiguratorState) => Promise<void>;
        onReset?: () => void;
    }

    export interface VisibilityToggleProps {
        items: { id: VisibleElement; label: string; checked: boolean }[];
        onToggle: (id: VisibleElement, checked: boolean) => void;
    }

    export interface BackgroundThemeGridProps {
        themes: OgTheme[];
        selectedId: string;
        onSelect: (themeId: string) => void;
    }

    export interface ShareButtonsBarProps {
        proposalUrl: string;
        proposalTitle: string;
        customMessage?: string;
    }

    export type SocialNetwork = 'twitter' | 'facebook' | 'linkedin';


}