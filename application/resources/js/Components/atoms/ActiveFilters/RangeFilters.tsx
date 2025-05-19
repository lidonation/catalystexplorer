import { FilteredItem } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { shortNumber } from '@/utils/shortNumber';

const RangeFilters = ({
    filter,
    setFilters,
}: {
    filter: FilteredItem;
    setFilters: (filter: FilteredItem) => void;
}) => {
    const removeFilter = () => {
        if (filter.param == ParamsEnum.PROJECT_LENGTH) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ParamsEnum.BUDGETS) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ParamsEnum.AWARDED_ADA) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ParamsEnum.AWARDED_USD) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ParamsEnum.PROPOSALS) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ParamsEnum.VOTING_POWER) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ParamsEnum.DELEGATORS) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ParamsEnum.RATINGS) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ParamsEnum.REPUTATION_SCORES) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ParamsEnum.HELPFUL) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        }
    };

    return (
        <div
            className="bg-background mr-1 flex items-center rounded-lg border px-1 py-1"
            key={filter.label}
        >
            <div className="mr-1">{filter.label}</div>
            <div>{`from ${shortNumber(filter.value[0])} to  ${shortNumber(filter.value[1])}`}</div>
            <button className="ml-2" onClick={() => removeFilter()}>
                X{' '}
            </button>
        </div>
    );
};

export default RangeFilters;
