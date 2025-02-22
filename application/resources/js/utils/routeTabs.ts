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
  }[];
}

export function generateTabs(t: TFunction, config: TabConfig): Tab[] {
  return config.tabs.map(tab => {
    const routeName = `${config.routePrefix}.${tab.routeName || tab.key}`;
    return {
      name: t(`${config.translationPrefix}.${tab.translationKey || tab.key}`),
      href: `/${config.routePrefix}/${tab.routeName || tab.key}`,
      routeName
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
    { key: 'lists' }
  ]
};

export const groupTabs: TabConfig = {
  translationPrefix: 'searchResults.tabs',
  routePrefix: 'groups/{group:slug}',
  tabs: [
      { key: 'proposals' },
      { key: 'connections' },
      { key: 'ideascaleProfiles',
        routeName: 'ideascale-profiles'
      },
      { key: 'reviews' },
      { key: 'locations' }
  ]
};
