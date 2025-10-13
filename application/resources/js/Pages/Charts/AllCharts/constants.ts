export const CHART_COLOR_PALETTE = [
    '#EBFBF1',
    '#D9F0E1',
    '#B9E0C6',
    '#A9DEBA',
    '#88D1A1',
    '#D4F1FA',
    '#B1E2F0',
    '#3FACD1',
    '#2596BE',
    '#165A72',
    '#0D3848',
    '#062029',
] as const;

type Palette = typeof CHART_COLOR_PALETTE;

export type ChartColor = Palette[number];
