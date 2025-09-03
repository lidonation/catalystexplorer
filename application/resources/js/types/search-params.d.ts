import { ParamsEnum } from '@/enums/proposal-search-params';

export type SearchParams = {
    length: number;
    [ParamsEnum.AWARDED_ADA]: number[];
    [ParamsEnum.AWARDED_USD]: number[];
    [ParamsEnum.BUDGETS]: number[];
    [ParamsEnum.CATEGORIES]: string;
    [ParamsEnum.CAMPAIGNS]: string[];
    [ParamsEnum.COHORT]: string[];
    [ParamsEnum.COMMUNITIES]: string[];
    [ParamsEnum.FUNDS]: string | string[];
    [ParamsEnum.FUNDING_STATUS]: string[] | string;
    [ParamsEnum.GROUPS]: string[];
    [ParamsEnum.LIMIT]: number;
    [ParamsEnum.MAX_BUDGET]: number;
    [ParamsEnum.MAX_PROJECT_LENGTH]: number;
    [ParamsEnum.MIN_BUDGET]: number;
    [ParamsEnum.MIN_PROJECT_LENGTH]: number;
    [ParamsEnum.OPENSOURCE_PROPOSALS]: string;
    [ParamsEnum.PAGE]: number;
    [ParamsEnum.IDEASCALE_PROFILES]: string[];
    [ParamsEnum.PROJECT_STATUS]: string[];
    [ParamsEnum.QUERY]: string;
    [ParamsEnum.QUICK_PITCHES]: string;
    [ParamsEnum.VIEW]: string;
    [ParamsEnum.SORTS]: string[];
    [ParamsEnum.TAGS]: string[];
    [ParamsEnum.TYPE]: string;
    [ParamsEnum.PROJECT_LENGTH]: number[];
    // New parameters
    [ParamsEnum.PROPOSALS]: string[];
    [ParamsEnum.REVIEWER_IDS]: string[];
    [ParamsEnum.HELPFUL]: string;
    [ParamsEnum.RATINGS]: string[];
    [ParamsEnum.REPUTATION_SCORES]: number[];
    [key: string]: any;
};
