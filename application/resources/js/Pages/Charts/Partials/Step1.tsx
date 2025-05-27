import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';

export default function Step1() {
    const { t } = useTranslation();
    const { setFilters, getFilter } = useFilterContext();

    return (
        <div>
            <Paragraph>{t('charts.selectProposals')}</Paragraph>
            <Paragraph>{t('charts.selectAllThatApply')}</Paragraph>
           <div>
             <div className='flex gap-2'>
                <Checkbox
                    value="funded"
                    checked={getFilter(ParamsEnum.FUNDING_STATUS)?.includes(
                        'funded',
                    )}
                    onChange={(e) => {
                        const current =
                            getFilter(ParamsEnum.FUNDING_STATUS) || [];
                        const isChecked = e.target.checked;
                        let updated;

                        if (isChecked) {
                            updated = [...current, 'funded'];
                        } else {
                            updated = current.filter(
                                (item: string) => item !== 'funded',
                            );
                        }

                        setFilters({
                            label: t('proposals.filters.fundingStatus'),
                            value: updated,
                            param: ParamsEnum.FUNDING_STATUS,
                        });
                    }}
                />
                <label htmlFor="submitted-proposals" className="text-sm">
                    {t('charts.submittedProposals')}
                </label>

            </div>
            <div className='flex gap-2'>
                <Checkbox
                    value="funded"
                    checked={getFilter(ParamsEnum.FUNDING_STATUS)?.includes(
                        'funded',
                    )}
                    onChange={(e) => {
                        const current =
                            getFilter(ParamsEnum.FUNDING_STATUS) || [];
                        const isChecked = e.target.checked;
                        let updated;

                        if (isChecked) {
                            updated = [...current, 'funded'];
                        } else {
                            updated = current.filter(
                                (item: string) => item !== 'funded',
                            );
                        }

                        setFilters({
                            label: t('proposals.filters.fundingStatus'),
                            value: updated,
                            param: ParamsEnum.FUNDING_STATUS,
                        });
                    }}
                />
                <label htmlFor="submitted-proposals" className="text-sm">
                    {t('charts.approvedProposals')}
                </label>
            </div><div className='flex gap-2'>
                <Checkbox
                    value="funded"
                    checked={getFilter(ParamsEnum.PROJECT_STATUS)?.includes(
                        'complete',
                    )}
                    onChange={(e) => {
                        const current =
                            getFilter(ParamsEnum.PROJECT_STATUS) || [];
                        const isChecked = e.target.checked;
                        let updated;

                        if (isChecked) {
                            updated = [...current, 'complete'];
                        } else {
                            updated = current.filter(
                                (item: string) => item !== 'complete',
                            );
                        }

                        setFilters({
                            label: t('proposals.filters.projectStatus'),
                            value: updated,
                            param: ParamsEnum.FUNDING_STATUS,
                        });
                    }}
                />
                <label htmlFor="submitted-proposals" className="text-sm">
                    {t('charts.completedProposals')}
                </label>
            </div>
           </div>
        </div>
    );
}
