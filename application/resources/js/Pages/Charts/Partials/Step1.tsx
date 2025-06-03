import React, { useEffect } from 'react';
import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';

interface Step1Props {
    onCompletionChange?: (isComplete: boolean) => void;
    onNext?: () => void;
}

export default function Step1({ onCompletionChange, onNext }: Step1Props) {
    const { t } = useTranslation();
    const { setFilters, getFilter } = useFilterContext();

    const hasSelections = () => {
        const fundingStatus = getFilter(ParamsEnum.FUNDING_STATUS) || [];
        const projectStatus = getFilter(ParamsEnum.PROJECT_STATUS) || [];
        return fundingStatus.length > 0 || projectStatus.length > 0;
    };

    const isComplete = hasSelections();

    useEffect(() => {
        onCompletionChange?.(isComplete);
    }, [isComplete, onCompletionChange]);

    return (
        <div>
            <Paragraph>{t('charts.selectProposals')}</Paragraph>
            <Paragraph className='mb-4'>{t('charts.selectAllThatApply')}</Paragraph>
           <div className='grid grid-cols-2 gap-2'>
             <div className='flex gap-2 items-center justify-center'>
                <Checkbox
                    value="submitted"
                    checked={getFilter(ParamsEnum.FUNDING_STATUS)?.includes(
                        'submitted',
                    )}
                    onChange={(e) => {
                        const current =
                            getFilter(ParamsEnum.FUNDING_STATUS) || [];
                        const isChecked = e.target.checked;
                        let updated;

                        if (isChecked) {
                            updated = [...current, 'submitted'];
                        } else {
                            updated = current.filter(
                                (item: string) => item !== 'submitted',
                            );
                        }

                        setFilters({
                            label: t('proposals.filters.fundingStatus'),
                            value: updated,
                            param: ParamsEnum.FUNDING_STATUS,
                        });
                    }}
                />
                <label htmlFor="submitted-proposals" className="text-base">
                    {t('charts.submittedProposals')}
                </label>

            </div>
            <div className='flex gap-2 items-center justify-center'>
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
                <label htmlFor="approved-proposals" className="text-base">
                    {t('charts.approvedProposals')}
                </label>
            </div>
            <div className='flex gap-2 items-center justify-center'>
                <Checkbox
                    value="complete"
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
                            param: ParamsEnum.PROJECT_STATUS,
                        });
                    }}
                />
                <label htmlFor="completed-proposals" className="text-base">
                    {t('charts.completedProposals')}
                </label>
            </div>
           </div>
           <PrimaryButton 
               className={`w-full mt-4 ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
               disabled={!isComplete}
               onClick={() => onNext?.()}
           >
               {t('charts.next')}
           </PrimaryButton>
        </div>
    );
}