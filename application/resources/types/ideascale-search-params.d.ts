import { IdeaScaleSearchEnum } from '@/enums/ideascale-search-enums';

export type IdeaScaleSearchParams = {
    [IdeaScaleSearchEnum.ALPHABETICAL]: string;
    [IdeaScaleSearchEnum.AWARDED_ADA]: string;
    [IdeaScaleSearchEnum.AWARDED_USD]: string;
    [IdeaScaleSearchEnum.PRIMARY_PROPOSAL_COUNT]: string;
    [IdeaScaleSearchEnum.CO_PROPOSAL_COUNT]: string;
    [IdeaScaleSearchEnum.DEFAULT]: string;
    [IdeaScaleSearchEnum.SORTS]: string;
};
