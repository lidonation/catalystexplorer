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

    const handleSubmittedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const current = [...(proposalTypes ?? [])];
        
        const updated = isChecked
            ? [...current, 'submitted']
            : current.filter((item) => item !== 'submitted');

        setFilters({
            label: t('charts.submittedProposals'),
            value: isChecked ? ['submitted'] : [],
            param: ParamsEnum.SUBMITTED_PROPOSALS,
        });

        setProposalTypes(updated);
    };

    const handleFundedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const current = [...(proposalTypes ?? [])];
        
        const updated = isChecked
            ? [...current, 'funded']
            : current.filter((item) => item !== 'funded');

        setFilters({
            label: t('proposals.filters.fundingStatus'),
            value: isChecked ? ['funded'] : [],
            param: ParamsEnum.FUNDING_STATUS,
        });

        setProposalTypes(updated);
    };

    const handleCompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const current = [...(proposalTypes ?? [])];
        
        const updated = isChecked
            ? [...current, 'complete']
            : current.filter((item) => item !== 'complete');

        setFilters({
            label: t('proposals.filters.projectStatus'),
            value: isChecked ? ['complete'] : [],
            param: ParamsEnum.PROJECT_STATUS,
        });

        setProposalTypes(updated);
    };

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
                        checked={getFilter(ParamsEnum.SUBMITTED_PROPOSALS)?.includes('submitted') || false}
                        onChange={handleSubmittedChange}
                        className="checked:bg-primary"
                    />
                    <label
                        htmlFor="submitted-proposals"
                        className="text-sm md:text-base"
                    >
                        {t('charts.submittedProposals')}
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="approved-proposals"
                        value="funded"
                        checked={getFilter(ParamsEnum.FUNDING_STATUS)?.includes('funded') || false}
                        onChange={handleFundedChange}
                        className="checked:bg-primary"
                    />
                    <label
                        htmlFor="approved-proposals"
                        className="text-sm md:text-base"
                    >
                        {t('charts.approvedProposals')}
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="completed-proposals"
                        value="complete"
                        checked={getFilter(ParamsEnum.PROJECT_STATUS)?.includes('complete') || false}
                        onChange={handleCompleteChange}
                        className="checked:bg-primary"
                    />
                    <label
                        htmlFor="completed-proposals"
                        className="text-sm md:text-base"
                    >
                        {t('charts.completedProposals')}
                    </label>
                </div>
            </div>
        </div>
    );
}