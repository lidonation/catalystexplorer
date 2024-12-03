import { ProposalParamsEnum } from '@/enums/proposal-search-params';

export type ProposalSearchParams = {
    [ProposalParamsEnum.AWARDED_ADA]: string;
    [ProposalParamsEnum.AWARDED_USD]: string;
    [ProposalParamsEnum.BUDGETS]: number[];
    [ProposalParamsEnum.CATEGORIES]: string;
    [ProposalParamsEnum.CAMPAIGNS]: number[];
    [ProposalParamsEnum.COHORT]: string[];
    [ProposalParamsEnum.COMMUNITIES]: number[];
    [ProposalParamsEnum.FUNDS]: string;
    [ProposalParamsEnum.FUNDING_STATUS]: string[];
    [ProposalParamsEnum.GROUPS]: number[];
    [ProposalParamsEnum.LIMIT]: number;
    [ProposalParamsEnum.MAX_BUDGET]: number;
    [ProposalParamsEnum.MAX_PROJECT_LENGTH]: number;
    [ProposalParamsEnum.MIN_BUDGET]: number;
    [ProposalParamsEnum.MIN_PROJECT_LENGTH]: number;
    [ProposalParamsEnum.OPENSOURCE_PROPOSALS]: string;
    [ProposalParamsEnum.PAGE]: number;
    [ProposalParamsEnum.PEOPLE]: number[];
    [ProposalParamsEnum.PROJECT_STATUS]: string[];
    [ProposalParamsEnum.QUERY]: string;
    [ProposalParamsEnum.QUICK_PITCHES]: string;
    [ProposalParamsEnum.VIEW]: string;
    [ProposalParamsEnum.SORTS]: string[];
    [ProposalParamsEnum.TAGS]: number[];
    [ProposalParamsEnum.TYPE]: string;
    [ProposalParamsEnum.PROJECT_LENGTH]: number[];
};

// export type ProposalSearchParams = {
//     AWARDED_ADA: string,
//     AWARDED_USD: string,
//     BUDGETS: array,
//     CATEGORIES: string,
//     CAMPAIGNS: string,
//     COHORT: string,
//     COMMUNITIES: string,
//     FUNDS: string,
//     FUNDING_STATUS: array,
//     GROUPS: string,
//     LIMIT: string,
//     MAX_BUDGET: string,
//     MAX_PROJECT_LENGTH: string,
//     MIN_BUDGET: string,
//     MIN_PROJECT_LENGTH: string,
//     OPENSOURCE_PROPOSALS: string,
//     PAGE: string,
//     PEOPLE: string,
//     PROJECT_STATUS: array,
//     QUERY: string,
//     QUICK_PITCHES: string,
//     VIEW: string,
//     SORTS: array,
//     TAGS: string,
//     TYPE: string,
// }
