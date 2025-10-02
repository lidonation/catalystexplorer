import ReplacementsInterface from 'laravel-react-i18n/dist/interfaces/replacements';

export interface Tab {
    name: string;
    href: string;
    routeName: string;
    only?: string[];
}

export interface TabConfig {
    translationPrefix: string;
    routePrefix: string;
    tabs: {
        key: string;
        translationKey?: string;
        routeName?: string;
        only?: string[];
    }[];
}

export function generateTabs(
    t: (key: string, replacements?: ReplacementsInterface) => string,
    config: TabConfig,
): Tab[] {
    return config.tabs.map((tab) => {
        const routeSuffix = tab.routeName !== undefined ? tab.routeName : tab.key;
        const routeName = routeSuffix ? `${config.routePrefix}.${routeSuffix}` : config.routePrefix;
        const href = routeSuffix ? `/${config.routePrefix}/${routeSuffix}` : `/${config.routePrefix}`;
        
        return {
            name: t(
                `${config.translationPrefix}.${tab.translationKey || tab.key}`,
            ),
            href,
            routeName,
            ...(tab.only && { only: tab.only }),
        };
    });
}

export const myProfileTabs: TabConfig = {
    translationPrefix: 'my',
    routePrefix: 'my',
    tabs: [
        { key: 'dashboard' },
        { key: 'profile' },
        { key: 'proposals' },
        { key: 'reviews' },
        { key: 'groups' },
        { key: 'communities' },
        { key: 'lists' },
        { key: 'transactions' },
        { key: 'votes' },
        { key: 'wallets' },
    ],
};

export const groupTabs: TabConfig = {
    translationPrefix: 'searchResults.tabs',
    routePrefix: 'groups/{group:slug}',
    tabs: [
        { key: 'proposals', only: ['proposals', 'group'] },
        { key: 'connections', only: ['connections', 'group'] },
        {
            key: 'ideascaleProfiles',
            routeName: 'ideascale-profiles',
            only: ['connections', 'group'],
        },
        { key: 'reviews', only: ['reviews', 'group', 'aggregatedRatings'] },
        { key: 'locations' },
    ],
};

export const ideascaleProfileTabs: TabConfig = {
    translationPrefix: 'ideascaleProfiles.tabs',
    routePrefix: 'ideascale-profiles/{hash}',
    tabs: [
        { key: 'proposals', only: ['proposals'] },
        { key: 'connections', only: ['connections'] },
        { key: 'groups', only: ['groups'] },
        { key: 'communities', only: ['communities'] },
        { key: 'reviews', only: ['reviews'] },
        { key: 'milestones', only: ['milestones'] },
        { key: 'reports', only: ['reports'] },
        { key: 'campaigns', only: ['campaigns'] },
    ],
};

export const communityTabs: TabConfig = {
    translationPrefix: 'communities',
    routePrefix: 'communities/{community:slug}',
    tabs: [
        { key: 'dashboard' },
        { key: 'proposals', only: ['proposals'] },
        { key: 'ideascale-profiles', only: ['ideascaleProfiles'] },
        { key: 'groups', only: ['groups'] },
        { key: 'events' },
    ],
};

export const proposalTabs: TabConfig = {
    translationPrefix: 'proposals.tabs',
    routePrefix: 'proposals/{slug}',
    tabs: [
        { key: 'details', routeName: 'details' },
        { key: 'schedule', routeName: 'schedule' },
        { key: 'community', routeName: 'community-review' },
        { key: 'team', routeName: 'team-information' },
    ],
};

export const campaignTabs: TabConfig = {
    translationPrefix: 'campaigns.tabs',
    routePrefix: 'active-fund/campaigns/{id}',
    tabs: [
        { key: 'overview', routeName: '' },
        { key: 'proposals', routeName: 'proposals' },
    ],
};
