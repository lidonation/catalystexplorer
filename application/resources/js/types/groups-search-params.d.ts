import { GroupsParamsEnum } from '@/enums/groups-search-params';

export type GroupsParamsEnum = {
    length: number;
    [GroupsParamsEnum.AWARDED_ADA]: string;
    [GroupsParamsEnum.AWARDED_USD]: string;
    [GroupsParamsEnum.CAMPAIGNS]: string[];
    [GroupsParamsEnum.COHORT]: string[];
    [GroupsParamsEnum.COMMUNITIES]: string[];
    [GroupsParamsEnum.FUNDS]: string[];
    [GroupsParamsEnum.FUNDED_PROPOSALS]: string[] | string;
    [GroupsParamsEnum.LIMIT]: number;
    [GroupsParamsEnum.PAGE]: number;
    [GroupsParamsEnum.IDEASCALE_PROFILES]: string[];
    [GroupsParamsEnum.QUERY]: string;
    [GroupsParamsEnum.SORTS]: string[];
    [GroupsParamsEnum.TAGS]: string[];
    [key: string]: any;
};
