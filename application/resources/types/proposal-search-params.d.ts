import { ProposalParamsEnum } from '@/enums/proposal-search-params';

export type ProposalSearchParams = {
    [ProposalParamsEnum.AWARDED_ADA]: string;
    [ProposalParamsEnum.AWARDED_USD]: string;
    [ProposalParamsEnum.BUDGETS]: number[];
    [ProposalParamsEnum.CATEGORIES]: string;
    [ProposalParamsEnum.CAMPAIGNS]: string;
    [ProposalParamsEnum.COHORT]: string;
    [ProposalParamsEnum.COMMUNITIES]: string;
    [ProposalParamsEnum.FUNDS]: string;
    [ProposalParamsEnum.FUNDING_STATUS]: string[];
    [ProposalParamsEnum.GROUPS]: string;
    [ProposalParamsEnum.LIMIT]: number;
    [ProposalParamsEnum.MAX_BUDGET]: number;
    [ProposalParamsEnum.MAX_PROJECT_LENGTH]: string;
    [ProposalParamsEnum.MIN_BUDGET]: number;
    [ProposalParamsEnum.MIN_PROJECT_LENGTH]: string;
    [ProposalParamsEnum.OPENSOURCE_PROPOSALS]: string;
    [ProposalParamsEnum.PAGE]: number;
    [ProposalParamsEnum.PEOPLE]: string;
    [ProposalParamsEnum.PROJECT_STATUS]: string[];
    [ProposalParamsEnum.QUERY]: string;
    [ProposalParamsEnum.QUICK_PITCHES]: string;
    [ProposalParamsEnum.VIEW]: string;
    [ProposalParamsEnum.SORTS]: string[];
    [ProposalParamsEnum.TAGS]: string;
    [ProposalParamsEnum.TYPE]: string;
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
