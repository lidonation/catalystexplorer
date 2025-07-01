import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Step1Props {
    onCompletionChange?: (isComplete: boolean) => void;
}

export default function Step1({ onCompletionChange }: Step1Props) {
    const { t } = useTranslation();
    const { setFilters, getFilter } = useFilterContext();

    const { value: proposalTypes, setValue: setProposalTypes } = useUserSetting<
        string[]
    >(userSettingEnums.PROPOSAL_TYPE, []);

    const isComplete = useMemo(() => {
        return (proposalTypes?.length ?? 0) > 0;
    }, [proposalTypes]);

    useEffect(() => {
        onCompletionChange?.(isComplete);
    }, [isComplete, onCompletionChange]);

    useEffect(() => {
        if (proposalTypes?.includes('submitted')) {
            setFilters({
                label: t('charts.submittedProposals'),
                value: ['submitted'],
                param: ParamsEnum.SUBMITTED_PROPOSALS,
            });
        } else {
            setFilters({
                label: t('charts.submittedProposals'),
                value: [],
                param: ParamsEnum.SUBMITTED_PROPOSALS,
            });
        }

        if (proposalTypes?.includes('approved')) {
            setFilters({
                label: t('proposals.filters.approvedProposals'),
                value: ['approved'],
                param: ParamsEnum.APPROVED_PROPOSALS,
            });
        } else {
            setFilters({
                label: t('proposals.filters.approvedProposals'),
                value: [],
                param: ParamsEnum.APPROVED_PROPOSALS,
            });
        }

        if (proposalTypes?.includes('complete')) {
            setFilters({
                label: t('proposals.filters.projectStatus'),
                value: ['complete'],
                param: ParamsEnum.COMPLETED_PROPOSALS,
            });
        } else {
            setFilters({
                label: t('proposals.filters.projectStatus'),
                value: [],
                param: ParamsEnum.COMPLETED_PROPOSALS,
            });
        }

        if (proposalTypes?.includes('unfunded')) {
            setFilters({
                label: t('charts.unfundedProposals'),
                value: ['unfunded'],
                param: ParamsEnum.UNFUNDED_PROPOSALS,
            });
        } else {
            setFilters({
                label: t('charts.unfundedProposals'),
                value: [],
                param: ParamsEnum.UNFUNDED_PROPOSALS,
            });
        }
    }, [proposalTypes, t, setFilters]);

    const handleCheckboxChange = (value: string, isChecked: boolean) => {
        const current = proposalTypes ?? [];
        const updated = isChecked
            ? current.includes(value)
                ? current
                : [...current, value]
            : current.filter((item) => item !== value);

        setProposalTypes(updated);
    };

    const handleSubmittedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleCheckboxChange('submitted', e.target.checked);
    };

    const handleFundedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleCheckboxChange('approved', e.target.checked);
    };

    const handleCompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleCheckboxChange('complete', e.target.checked);
    };

    const handleUnfundedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleCheckboxChange('unfunded', e.target.checked);
    };

    const submittedDisabled = proposalTypes?.includes('approved') || proposalTypes?.includes('complete') || proposalTypes?.includes('unfunded');
    const disabled = proposalTypes?.includes('submitted')

    return (
        <div>
            <Paragraph>{t('charts.selectProposals')}</Paragraph>
            <Paragraph className="mb-4">
                {t('charts.selectAllThatApply')}
            </Paragraph>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="submitted-proposals"
                        value="submitted"
                        checked={
                            getFilter(ParamsEnum.SUBMITTED_PROPOSALS)?.includes(
                                'submitted',
                            ) || false
                        }
                        onChange={handleSubmittedChange}
                        className="checked:bg-primary"
                        disabled={submittedDisabled}
                    />
                    <label
                        htmlFor="submitted-proposals"
                        className={`text-sm md:text-base ${submittedDisabled ? 'text-gray-persist cursor-not-allowed' : ''}`}
                    >
                        {t('charts.submittedProposals')}
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="approved-proposals"
                        value="approved"
                        checked={
                            getFilter(ParamsEnum.APPROVED_PROPOSALS)?.includes(
                                'approved',
                            ) || false
                        }
                        onChange={handleFundedChange}
                        className="checked:bg-primary"
                        disabled={disabled}
                    />
                    <label
                        htmlFor="approved-proposals"
                        className={`text-sm md:text-base ${disabled ? 'text-gray-persist cursor-not-allowed' : ''}`}
                    >
                        {t('charts.approvedProposals')}
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="completed-proposals"
                        value="complete"
                        checked={
                            getFilter(ParamsEnum.COMPLETED_PROPOSALS)?.includes(
                                'complete',
                            ) || false
                        }
                        onChange={handleCompleteChange}
                        disabled={disabled}
                        className="checked:bg-primary"
                    />
                    <label
                        htmlFor="completed-proposals"
                         className={`text-sm md:text-base ${disabled ? 'text-gray-persist cursor-not-allowed' : ''}`}
                    >
                        {t('charts.completedProposals')}
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="unfunded-proposals"
                        value="unfunded"
                        checked={
                            getFilter(ParamsEnum.UNFUNDED_PROPOSALS)?.includes(
                                'unfunded',
                            ) || false
                        }
                        onChange={handleUnfundedChange}
                        className="checked:bg-primary"
                        disabled={disabled}
                    />
                    <label
                        htmlFor="unfunded-proposals"
                         className={`text-sm md:text-base ${disabled ? 'text-gray-persist cursor-not-allowed' : ''}`}
                    >
                        {t('charts.unfundedProposals')}
                    </label>
                </div>
            </div>
        </div>
    );
}
