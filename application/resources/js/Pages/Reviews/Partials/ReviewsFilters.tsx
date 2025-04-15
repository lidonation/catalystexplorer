import { RangePicker } from '@/Components/RangePicker';
import { useTranslation } from 'react-i18next';
import { SearchSelect } from '@/Components/SearchSelect';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';

const ReviewsFilter = () => {
    const { t } = useTranslation();
    const { setFilters, getFilter } = useFilterContext();
    const ratingRange = [1, 5];
    const reputationRange = [1, 100];

    return (
        <div className="mb-6 w-full">
            <div className="bg-background w-full rounded-xl p-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-3 lg:grid-cols-3">
                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('reviews.filters.funds')}</span>
                        <SearchSelect
                            key={'fund-titles'}
                            domain={'fundTitles'}
                            selected={getFilter(ParamsEnum.FUNDS) ?? []}
                            onChange={(value) => 
                                setFilters({
                                    label: t('reviews.filters.funds'),
                                    value,
                                    param: ParamsEnum.FUNDS,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                        />
                    </div>
                    
                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('reviews.filters.proposals')}</span>
                        <SearchSelect
                            key={'proposals'}
                            domain={'proposals'}
                            selected={getFilter(ParamsEnum.PROPOSALS) ?? []}
                            onChange={(value) =>
                                setFilters({
                                    label: t('reviews.filters.proposals'),
                                    value,
                                    param: ParamsEnum.PROPOSALS,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                        />
                    </div>
                    
                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('reviews.filters.reviewerIds')}</span>
                        <SearchSelect
                            key={'reviewers'}
                            domain={'reviewers'}
                            selected={getFilter(ParamsEnum.REVIEWER_IDS) ?? []}
                            onChange={(value) =>
                                setFilters({
                                    label: t('reviews.filters.reviewerIds'),
                                    value,
                                    param: ParamsEnum.REVIEWER_IDS,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                        />
                    </div>
                </div>

                <div className="my-6 w-full border-b"></div>
                
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl lg:grid-cols-2">
                    <div className="pb-4">
                        <RangePicker
                            key={'Rating'}
                            context={t('reviews.filters.ratings')}
                            value={
                                getFilter(ParamsEnum.RATINGS)?.length === 0
                                    ? ratingRange
                                    : getFilter(ParamsEnum.RATINGS)
                            }
                            onValueChange={(value) =>
                                setFilters({
                                    label: t('reviews.filters.ratings'),
                                    value,
                                    param: ParamsEnum.RATINGS,
                                })
                            }
                            max={ratingRange[1]}
                            min={ratingRange[0]}
                            defaultValue={ratingRange}
                        />
                    </div>

                    <div className="pb-4">
                        <RangePicker
                            key={'Reputation Score'}
                            context={t('reviews.filters.reputationScores')}
                            value={
                                getFilter(ParamsEnum.REPUTATION_SCORES)?.length === 0
                                    ? reputationRange
                                    : getFilter(ParamsEnum.REPUTATION_SCORES)
                            }
                            onValueChange={(value) =>
                                setFilters({
                                    label: t('reviews.filters.reputationScores'),
                                    value,
                                    param: ParamsEnum.REPUTATION_SCORES,
                                })
                            }
                            max={reputationRange[1]}
                            min={reputationRange[0]}
                            defaultValue={reputationRange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewsFilter;