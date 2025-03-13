import { RangePicker } from '@/Components/RangePicker';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext'; // Import the custom hook
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';

export default function DrepFilters() {
    const { t } = useTranslation();
    const { filters, setFilters, getFilter } = useFilterContext();

    const votingPowerRange = [0, 10000000];
    const delegatorsRange = [0, 1000];

    return (
        <div className="bg-background mb-8 w-full rounded-xl p-4 shadow-md">
            <div className="grid grid-cols-1 items-center">
                <div>
                    <span className="mb-1 block text-sm font-medium">
                        {t('dreps.drepStatus')}
                    </span>
                    <Selector
                        isMultiselect={false}
                        options={[
                            {
                                value: 'active',
                                label: t('dreps.options.active'),
                            },
                            {
                                value: 'inactive',
                                label: t('dreps.options.inactive'),
                            },
                        ]}
                        setSelectedItems={(value) =>
                            setFilters({
                                label: t('dreps.filters.status'),
                                value,
                                param: ParamsEnum.DREP_STATUS,
                            })
                        }
                        selectedItems={getFilter(ParamsEnum.DREP_STATUS)}
                    />
                </div>

                <div className="mt-6 grid lg:grid-cols-2 grid-cols-1 gap-8">
                    <RangePicker
                        key={'votingPower'}
                        context={t('dreps.votingPowerAda')}
                        value={
                            getFilter(ParamsEnum.VOTING_POWER)?.length == 0
                                ? votingPowerRange
                                : getFilter(ParamsEnum.VOTING_POWER)
                        }
                        onValueChange={(value) =>
                            setFilters({
                                label: t('dreps.filters.votingPower'),
                                value,
                                param: ParamsEnum.VOTING_POWER,
                            })
                        }
                        max={votingPowerRange[1]}
                        min={votingPowerRange[0]}
                        defaultValue={votingPowerRange}
                    />
                    <RangePicker
                        key={'Budgets'}
                        context={t('dreps.drepList.delegators')}
                        value={
                            getFilter(ParamsEnum.DELEGATORS)?.length == 0
                                ? votingPowerRange
                                : getFilter(ParamsEnum.DELEGATORS)
                        }
                        onValueChange={(value) =>
                            setFilters({
                                label: t('dreps.filters.delegators'),
                                value,
                                param: ParamsEnum.DELEGATORS
                            })
                        }
                        max={delegatorsRange[1]}
                        min={delegatorsRange[0]}
                        defaultValue={delegatorsRange}
                    />
                </div>
            </div>
        </div>
    );
}
