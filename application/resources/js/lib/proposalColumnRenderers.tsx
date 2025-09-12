import React from 'react';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ProposalData = App.DataTransferObjects.ProposalData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import Paragraph from '@/Components/atoms/Paragraph';
import SecondaryLink from '@/Components/SecondaryLink';
import YesVoteIcon from '@/Components/svgs/YesVoteIcon';
import AbstainVoteIcon from '@/Components/svgs/AbstainVoteIcon';
import ProposalCardHeader from '@/Pages/Proposals/Partials/ProposalCardHeader';
import ProposalFundingPercentages from '@/Pages/Proposals/Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import { shortNumber } from '@/utils/shortNumber';
import { currency } from '@/utils/currency';

/**
 * Safely gets a nested value from an object using dot notation
 */
export function getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}


export function generateColumnHeader(path: string): string {
    if (!path) return '';
    
    const parts = path.split('.');
    
    if (parts.length > 1) {
        // Nested property (e.g., 'fund.title' -> 'Fund: Title')
        const parentPart = parts[0];
        const childPart = parts[parts.length - 1];
        
        const parentFormatted = parentPart
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
        const childFormatted = childPart
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
        return `${parentFormatted}: ${childFormatted}`;
    }
    
    // Simple property (e.g., 'quickpitch_length' -> 'Quickpitch Length')
    return path
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export interface TableHelpers {
    selectedUser: IdeascaleProfileData | null;
    handleUserClick: (user: IdeascaleProfileData) => void;
    noSelectedUser: () => void;
}

/**
 * Configuration type for column renderers
 */
export type ColumnRendererConfig = {
    type: 'link' | 'avatar' | 'currency' | 'component';
    component?: React.ComponentType<{ proposal: ProposalData; helpers?: TableHelpers }>;
    sortKey?: string;
    sortable?: boolean;
} | React.ComponentType<{ proposal: ProposalData; helpers?: TableHelpers }> | {};

/**
 * Default Central configuration can be overriden from parent
 */
export const proposalColumnRenderers: Record<string, ColumnRendererConfig> = {
    'title': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => {
            const { t } = useLaravelReactI18n();
            return (
                <div className="w-80" data-testid={`proposal-title-${proposal.id}`}>
                    <Paragraph className="text-md text-content" data-testid={`proposal-title-text-${proposal.id}`}>
                        <Link
                            href={proposal.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                            data-testid={`view-proposal-button-${proposal.id}`}
                        >
                            {proposal.title}
                        </Link>
                    </Paragraph>
                </div>
            );
        },
        sortKey: 'title',
        sortable: true
    },

    'proposal': {
        type: 'component',
        component: ({ proposal, helpers }: { proposal: ProposalData; helpers?: TableHelpers }) => (
            <div className="w-80" data-testid={`proposal-card-header-${proposal.id}`}>
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={helpers?.selectedUser ?? null}
                    noSelectedUser={helpers?.noSelectedUser ?? (() => {})}
                    isHorizontal={false}
                    data-testid={`proposal-card-${proposal.id}`}
                />
            </div>
        ),
        sortKey: 'title',
        sortable: true
    },

    'fund': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => {
            const { t } = useLaravelReactI18n();
            return (
                <div
                    className="flex items-center justify-center border border-light-gray-persist bg-light-gray-persist/[10%] px-1 rounded-md"
                    data-testid={`proposal-fund-${proposal.id}`}
                >
                    {proposal.fund?.label && (
                        <Paragraph className="items-center py-1 rounded-full text-xs font-medium text-content text-nowrap"
                                  data-testid={`proposal-fund-label-${proposal.id}`}>
                            {proposal.fund.label}
                        </Paragraph>
                    )}
                </div>
            );
        },
        sortKey: 'fund_id',
        sortable: true
    },

    'status': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => (
            <div className="flex w-32 items-center justify-center" data-testid={`proposal-status-${proposal.id}`}>
                <ProposalFundingStatus
                    funding_status={proposal.funding_status ?? ''}
                    data-testid={`proposal-funding-status-${proposal.id}`}
                />
            </div>
        ),
        sortKey: 'funding_status',
        sortable: true
    },

    'funding_status': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => (
            <div className="flex w-32 items-center justify-center" data-testid={`proposal-status-${proposal.id}`}>
                <ProposalFundingStatus
                    funding_status={proposal.funding_status ?? ''}
                    data-testid={`proposal-funding-status-${proposal.id}`}
                />
            </div>
        ),
        sortKey: 'funding_status',
        sortable: true
    },

    'funding': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => {
            const { t } = useLaravelReactI18n();
            return (
                <div className="flex w-60" data-testid={`proposal-funding-${proposal.id}`}>
                    <ProposalFundingPercentages
                        proposal={proposal}
                        data-testid={`proposal-funding-percentages-${proposal.id}`}
                    />
                </div>
            );
        },
        sortKey: 'amount_received',
        sortable: true
    },

    'teams': {
        type: 'component',
        component: ({ proposal, helpers }: { proposal: ProposalData; helpers?: TableHelpers }) => {
            const { t } = useLaravelReactI18n();
            return (
                <div className="w-40" data-testid={`proposal-teams-${proposal.id}`}>
                    <IdeascaleProfileUsers
                        users={proposal.users}
                        onUserClick={helpers?.handleUserClick}
                        className="bg-content-light"
                        toolTipProps={t('proposals.viewTeam')}
                        data-testid={`proposal-ideascale-users-${proposal.id}`}
                    />
                </div>
            );
        },
        sortKey: 'users.proposals_completed',
        sortable: false
    },

    'users': {
        type: 'component',
        component: ({ proposal, helpers }: { proposal: ProposalData; helpers?: TableHelpers }) => {
            const { t } = useLaravelReactI18n();
            return (
                <div className="w-40" data-testid={`proposal-teams-${proposal.id}`}>
                    <IdeascaleProfileUsers
                        users={proposal.users}
                        onUserClick={helpers?.handleUserClick}
                        className="bg-content-light"
                        toolTipProps={t('proposals.viewTeam')}
                        data-testid={`proposal-ideascale-users-${proposal.id}`}
                    />
                </div>
            );
        },
        sortKey: 'users.proposals_completed',
        sortable: false
    },

    'yesVotes': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => {
            const { t } = useLaravelReactI18n();
            return (
                <div className="text-center" data-testid={`proposal-yes-votes-${proposal.id}`}>
                    <div className="flex items-center justify-center gap-2"
                         data-testid={`proposal-yes-votes-content-${proposal.id}`}>
                        <Paragraph className="text-light-gray-persist"
                                   data-testid={`proposal-yes-votes-count-${proposal.id}`}>
                            ({shortNumber(proposal.yes_votes_count) || '0'})
                        </Paragraph>
                    </div>
                </div>
            );
        },
        sortKey: 'yes_votes_count',
        sortable: true
    },

    'yes_votes_count': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => (
            <div className="text-center" data-testid={`proposal-yes-votes-${proposal.id}`}>
                <Paragraph className="text-light-gray-persist"
                           data-testid={`proposal-yes-votes-count-${proposal.id}`}>
                    {shortNumber(proposal.yes_votes_count) || '0'}
                </Paragraph>
            </div>
        ),
        sortKey: 'yes_votes_count',
        sortable: true
    },

    'abstainVotes': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => {
            const { t } = useLaravelReactI18n();
            return (
                <div className="text-center" data-testid={`proposal-abstain-votes-${proposal.id}`}>
                    <div className="flex items-center justify-center gap-2"
                         data-testid={`proposal-abstain-votes-content-${proposal.id}`}>
                        <Paragraph className="text-light-gray-persist"
                                   data-testid={`proposal-abstain-votes-count-${proposal.id}`}>
                            ({shortNumber(proposal.abstain_votes_count) || '0'})
                        </Paragraph>
                    </div>
                </div>
            );
        },
        sortKey: 'abstain_votes_count',
        sortable: true
    },

    'abstain_votes_count': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => (
            <div className="text-center" data-testid={`proposal-abstain-votes-${proposal.id}`}>
                <Paragraph className="text-light-gray-persist"
                           data-testid={`proposal-abstain-votes-count-${proposal.id}`}>
                    {shortNumber(proposal.abstain_votes_count) || '0'}
                </Paragraph>
            </div>
        ),
        sortKey: 'abstain_votes_count',
        sortable: true
    },

    'budget': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => {
            const currencyCode = proposal.currency || 'USD';
            const formattedBudget = proposal.amount_requested
                ? (currency(parseInt(proposal.amount_requested.toString()), 2, currencyCode) as string)
                : '–';

            return (
                <div data-testid={`proposal-budget-${proposal.id}`}>
                    <Paragraph className="text-md font-medium text-content" data-testid={`proposal-budget-amount-${proposal.id}`}>
                        {formattedBudget}
                    </Paragraph>
                </div>
            );
        },
        sortKey: 'amount_requested',
        sortable: true
    },

    'category': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => (
            <div data-testid={`proposal-category-${proposal.id}`}>
                <div className="flex items-center">
                    <Paragraph className="text-md" data-testid={`proposal-campaign-label-${proposal.id}`}>
                        {proposal.campaign?.title || proposal.fund?.label || '–'}
                    </Paragraph>
                </div>
            </div>
        ),
        sortKey: 'campaign_id',
        sortable: true
    },

    'openSourced': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => {
            const { t } = useLaravelReactI18n();
            return (
                <div className="text-center w-24" data-testid={`proposal-opensourced-${proposal.id}`}>
                    <Paragraph className={`inline-flex items-center px-2 py-1 text-xs font-medium`} data-testid={`proposal-opensourced-status-${proposal.id}`}>
                        {proposal.opensource ? t('Yes') : t('No')}
                    </Paragraph>
                </div>
            );
        },
        sortKey: 'opensourced',
        sortable: true
    },

    'opensource': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => {
            const { t } = useLaravelReactI18n();
            return (
                <div className="text-center w-24" data-testid={`proposal-opensourced-${proposal.id}`}>
                    <Paragraph className={`inline-flex items-center px-2 py-1 text-xs font-medium`} data-testid={`proposal-opensourced-status-${proposal.id}`}>
                        {proposal.opensource ? t('Yes') : t('No')}
                    </Paragraph>
                </div>
            );
        },
        sortKey: 'opensourced',
        sortable: true
    },

    'campaign.title': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => (
            <div data-testid={`proposal-campaign-title-${proposal.id}`}>
                <Paragraph className="text-md" data-testid={`proposal-campaign-title-text-${proposal.id}`}>
                    {proposal.campaign?.title || '–'}
                </Paragraph>
            </div>
        ),
        sortKey: 'campaign_id',
        sortable: true
    },

    'fund.label': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => (
            <div data-testid={`proposal-fund-label-${proposal.id}`}>
                <Paragraph className="text-md" data-testid={`proposal-fund-label-text-${proposal.id}`}>
                    {proposal.fund?.label || '–'}
                </Paragraph>
            </div>
        ),
        sortKey: 'fund_id',
        sortable: true
    },
    'no_votes_count': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => (
            <div className="text-center" data-testid={`proposal-no-votes-${proposal.id}`}>
                <Paragraph className="text-light-gray-persist"
                           data-testid={`proposal-no-votes-count-${proposal.id}`}>
                    {shortNumber(proposal.no_votes_count) || '0'}
                </Paragraph>
            </div>
        ),
        sortKey: 'no_votes_count',
        sortable: true
    },
    'schedule.on_track': {
        type: 'component',
        component: ({ proposal }: { proposal: ProposalData }) => {
            const { t } = useLaravelReactI18n();
            const onTrack = proposal.schedule?.on_track;
            return (
                <div className="text-center w-24" data-testid={`proposal-on-track-${proposal.id}`}>
                    <Paragraph className={`inline-flex items-center px-2 py-1 text-xs font-medium`} 
                               data-testid={`proposal-on-track-status-${proposal.id}`}>
                        {onTrack ? t('Yes') : t('No')}
                    </Paragraph>
                </div>
            );
        },
        sortKey: 'schedule.on_track',
        sortable: true
    }
};

 // Default column headers for common column types
export const defaultColumnHeaders: Record<string, string | React.ReactNode> = {
    'yesVotes': 'Yes Votes',
    'abstainVotes': 'Abstain Votes'
};

// Dynamic column headers that require translation context
export const getDynamicColumnHeaders = (t: (key: string) => string): Record<string, React.ReactNode> => ({
    'yesVotes': (
        <div className="flex items-center gap-2" data-testid="yes-votes-header">
            <YesVoteIcon
                className="size-5 font-medium text-success"
                width={20}
                height={20}
                data-testid="yes-vote-icon"
            />
            <div className="flex gap-2 text-content/60" data-testid="yes-votes-label">
                <Paragraph size="sm">{t('proposalTable.yesVotes')}</Paragraph>
            </div>
        </div>
    ),
    'abstainVotes': (
        <div className="flex items-center gap-2" data-testid="abstain-votes-header">
            <AbstainVoteIcon
                className="size-4 font-medium"
                width={16}
                height={16}
                data-testid="abstain-vote-icon"
            />
            <div className="flex gap-2 text-content/60" data-testid="abstain-votes-label">
                <Paragraph size="sm">{t('proposalTable.abstainVotes')}</Paragraph>
            </div>
        </div>
    )
});

/**
 * Built-in renderers for simple types
 */
export const builtInRenderers = {
    text: ({ proposal, path }: { proposal: ProposalData; path: string }) => {
        const value = getNestedValue(proposal, path);
        return (
            <Paragraph className="text-md text-content" data-testid={`proposal-${path.replace(/\./g, '-')}-${proposal.id}`}>
                {value?.toString() || '–'}
            </Paragraph>
        );
    },
    
    link: ({ proposal, path }: { proposal: ProposalData; path: string }) => {
        const value = getNestedValue(proposal, path);
        const displayText = value || '–';
        
        if (!value || typeof value !== 'string') {
            return <Paragraph>{displayText}</Paragraph>;
        }

        const isUrl = value.startsWith('http://') || value.startsWith('https://');
        
        if (isUrl) {
            return (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover underline"
                    data-testid={`proposal-${path.replace(/\./g, '-')}-link-${proposal.id}`}
                >
                    {displayText}
                </a>
            );
        }
        
        return <Paragraph>{displayText}</Paragraph>;
    },
    
    currency: ({ proposal, path }: { proposal: ProposalData; path: string }) => {
        const value = getNestedValue(proposal, path);
        // Get currency from the proposal, fund, campaign, or schedule context
        let currencyCode = proposal.currency || 
                          proposal.fund?.currency || 
                          proposal.campaign?.currency || 
                          proposal.schedule?.currency || 
                          'ADA';
        
        if (value === null || value === undefined || isNaN(Number(value))) {
            return <Paragraph>–</Paragraph>;
        }
        
        const numericValue = Number(value);
        const formattedValue = currency(numericValue, 2, currencyCode) as string;
        
        return (
            <Paragraph className="text-md font-medium text-content" data-testid={`proposal-${path.replace(/\./g, '-')}-${proposal.id}`}>
                {formattedValue}
            </Paragraph>
        );
    },
    
    boolean: ({ proposal, path }: { proposal: ProposalData; path: string }) => {
        const { t } = useLaravelReactI18n();
        const value = getNestedValue(proposal, path);
        const displayValue = value === true ? t('yes') : value === false ? t('no') : '–';
        
        return (
            <Paragraph className="text-md text-content" data-testid={`proposal-${path.replace(/\./g, '-')}-${proposal.id}`}>
                {displayValue}
            </Paragraph>
        );
    },
    
    date: ({ proposal, path }: { proposal: ProposalData; path: string }) => {
        const value = getNestedValue(proposal, path);
        
        if (!value) {
            return <Paragraph>–</Paragraph>;
        }
        
        try {
            const date = new Date(value);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            return (
                <Paragraph className="text-md text-content" data-testid={`proposal-${path.replace(/\./g, '-')}-${proposal.id}`}>
                    {formattedDate}
                </Paragraph>
            );
        } catch (error) {
            return <Paragraph>{value?.toString() || '–'}</Paragraph>;
        }
    },
    
    number: ({ proposal, path }: { proposal: ProposalData; path: string }) => {
        const value = getNestedValue(proposal, path);
        
        if (value === null || value === undefined || isNaN(Number(value))) {
            return <Paragraph>–</Paragraph>;
        }
        
        const formattedNumber = Number(value).toLocaleString();
        
        return (
            <Paragraph className="text-md text-content" data-testid={`proposal-${path.replace(/\./g, '-')}-${proposal.id}`}>
                {formattedNumber}
            </Paragraph>
        );
    }
};
