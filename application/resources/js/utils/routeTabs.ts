import { TFunction } from 'i18next';

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

export function generateTabs(t: TFunction, config: TabConfig): Tab[] {
  
  return config.tabs.map(tab => {
    const routeName = `${config.routePrefix}.${tab.routeName || tab.key}`;
    return {
      name: t(`${config.translationPrefix}.${tab.translationKey || tab.key}`),
      href: `/${config.routePrefix}/${tab.routeName || tab.key}`,
      routeName,
      ...(tab.only && { only: tab.only })
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
    {key: 'transactions'}
  ]
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
      only: ['connections', 'group']
    },
    { key: 'reviews', only: ['reviews', 'group', 'aggregatedRatings'] },
    { key: 'locations' }
  ]
};

export const ideascaleProfileTabs: TabConfig = {
  translationPrefix: 'ideascaleProfiles.tabs',
  routePrefix: 'ideascale-profiles/{hash}',
  tabs: [
    { key: 'proposals', only: ['proposals'] },
    { key: 'connections', only: ['connections'] },
    { key: 'groups', only: ['groups'] },
    { key: 'communities', only: ['communities'] },
    { key: 'reviews', only: ['reviews',] },
    { key: 'milestones', only: ['milestones'] },
    { key: 'reports', only: ['reports'] },
    { key: 'campaigns', only: ['campaigns'] },
  ]
};

export const communityTabs: TabConfig = {
  translationPrefix: 'communities',
  routePrefix: 'communities/{community:slug}',
  tabs: [
    { key: 'dashboard' },
    { key: 'proposals', only: ['proposals'] },
    { key: 'ideascale-profiles', only: ['ideascaleProfiles'] },
    { key: 'groups', only: ['groups'] },
    { key: 'events' }
  ]
};



