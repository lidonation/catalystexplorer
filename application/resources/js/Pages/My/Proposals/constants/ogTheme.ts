export interface OgTheme {
    id: string;
    name: string;
    gradientStart: string;
    gradientEnd: string;
    cssGradient: string;
}

export const OG_THEMES: OgTheme[] = [
    {
        id: 'navy-teal',
        name: 'Navy Teal',
        gradientStart: 'var(--og-navy-teal-start)',
        gradientEnd: 'var(--og-navy-teal-end)',
        cssGradient: 'linear-gradient(45deg, var(--og-navy-teal-start) 0%, var(--og-navy-teal-end) 100%)',
    },
    {
        id: 'magenta-rose',
        name: 'Magenta Rose',
        gradientStart: 'var(--og-magenta-rose-start)',
        gradientEnd: 'var(--og-magenta-rose-end)',
        cssGradient: 'linear-gradient(45deg, var(--og-magenta-rose-start) 0%, var(--og-magenta-rose-end) 100%)',
    },
    {
        id: 'royal-blue',
        name: 'Royal Blue',
        gradientStart: 'var(--og-royal-blue-start)',
        gradientEnd: 'var(--og-royal-blue-end)',
        cssGradient: 'linear-gradient(45deg, var(--og-royal-blue-start) 0%, var(--og-royal-blue-end) 100%)',
    },
    {
        id: 'emerald-green',
        name: 'Emerald Green',
        gradientStart: 'var(--og-emerald-green-start)',
        gradientEnd: 'var(--og-emerald-green-end)',
        cssGradient: 'linear-gradient(45deg, var(--og-emerald-green-start) 0%, var(--og-emerald-green-end) 100%)',
    },
    {
        id: 'teal-cyan',
        name: 'Teal Cyan',
        gradientStart: 'var(--og-teal-cyan-start)',
        gradientEnd: 'var(--og-teal-cyan-end)',
        cssGradient: 'linear-gradient(45deg, var(--og-teal-cyan-start) 0%, var(--og-teal-cyan-end) 100%)',
    },
    {
        id: 'sunset-orange',
        name: 'Sunset Orange',
        gradientStart: 'var(--og-sunset-orange-start)',
        gradientEnd: 'var(--og-sunset-orange-end)',
        cssGradient: 'linear-gradient(45deg, var(--og-sunset-orange-start) 0%, var(--og-sunset-orange-end) 100%)',
    },
    {
        id: 'lime-yellow',
        name: 'Lime Yellow',
        gradientStart: 'var(--og-lime-yellow-start)',
        gradientEnd: 'var(--og-lime-yellow-end)',
        cssGradient: 'linear-gradient(45deg, var(--og-lime-yellow-start) 0%, var(--og-lime-yellow-end) 100%)',
    },
    {
        id: 'amber-orange',
        name: 'Amber Orange',
        gradientStart: 'var(--og-amber-orange-start)',
        gradientEnd: 'var(--og-amber-orange-end)',
        cssGradient: 'linear-gradient(45deg, var(--og-amber-orange-start) 0%, var(--og-amber-orange-end) 100%)',
    },

]

export const DEFAULT_THEME_ID = 'navy-teal';

export const DEFAULT_VISIBLE_ELEMENTS: App.ShareCard.VisibleElement[] = [
    'myVote',
    'logo',
    'campaignTitle',
    'openSourceBadge',
    'totalVotes'
];

export const DEFAULT_CONFIG: App.ShareCard.ConfiguratorState = {
    visibleElements: DEFAULT_VISIBLE_ELEMENTS,
    selectedThemeId: DEFAULT_THEME_ID,
    customColor: null,
    customMessage: '',
    callToActionText: 'View Proposal',
    logoUrl: null
};