import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import InformationIcon from '@/Components/svgs/InformationIcon';
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

        if (proposalTypes?.includes('in_progress')) {
            setFilters({
                label: t('charts.inProgressProposals'),
                value: ['in_progress'],
                param: ParamsEnum.IN_PROGRESS,
            });
        } else {
            setFilters({
                label: t('charts.inProgressProposals'),
                value: [],
                param: ParamsEnum.IN_PROGRESS,
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
        const isChecked = e.target.checked;
        const current = proposalTypes ?? [];

        if (isChecked) {
            setProposalTypes(['submitted']);
        } else {
            const updated = current.filter((item) => item !== 'submitted');
            setProposalTypes(updated);
        }
    };

    const handleUnfundedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const current = proposalTypes ?? [];

        if (isChecked) {
            const updated = current
                .filter((item) => item !== 'submitted')
                .concat('unfunded');
            setProposalTypes([...new Set(updated)]);
        } else {
            const updated = current.filter((item) => item !== 'unfunded');
            setProposalTypes(updated);
        }
    };

    const handleFundedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const current = proposalTypes ?? [];

        if (isChecked) {
            const updated = current
                .filter((item) => item !== 'submitted' && item !== 'complete' && item !== 'in_progress')
                .concat('approved');
            setProposalTypes([...new Set(updated)]);
        } else {
            const updated = current.filter((item) => item !== 'approved');
            setProposalTypes(updated);
        }
    };

    const handleCompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const current = proposalTypes ?? [];

        if (isChecked) {
            const updated = current
                .filter((item) => item !== 'submitted' && item !== 'approved')
                .concat('complete');
            setProposalTypes([...new Set(updated)]);
        } else {
            const updated = current.filter((item) => item !== 'complete');
            setProposalTypes(updated);
        }
    };

    const handleInProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const current = proposalTypes ?? [];

        if (isChecked) {
            const updated = current
                .filter((item) => item !== 'submitted' && item !== 'approved')
                .concat('in_progress');
            setProposalTypes([...new Set(updated)]);
        } else {
            const updated = current.filter((item) => item !== 'in_progress');
            setProposalTypes(updated);
        }
    };

    return (
        <div>
            <Paragraph>{t('charts.selectProposals')}</Paragraph>
            <div className="mb-4 flex items-center gap-2">
                <Paragraph>{t('charts.selectAllThatApply')}</Paragraph>
                <div className="flex justify-center">
                    <div className="group relative">
                        <InformationIcon className="mx-auto" />
                        <div className="bg-tooltip absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded p-2 text-white shadow-lg group-hover:block">
                          <Paragraph> {t('charts.filterProposal')}</Paragraph>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-gray-persist/30 mb-2 flex w-full items-center justify-between gap-2 border-b pr-2 pb-4">
                <label
                    htmlFor="unfunded-proposals"
                    className="text-sm font-bold md:text-base"
                >
                    {t('charts.unfundedProposals')}
                </label>
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
                />
            </div>
            <div className="border-gray-persist/30 mb-2 flex flex-col gap-2 border-b pr-2 pb-4">
                <div className="flex w-full items-center justify-between gap-2">
                    <label
                        htmlFor="approved-proposals"
                        className="text-sm font-bold md:text-base"
                    >
                        {t('charts.fundedProposals')}
                    </label>
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
                    />
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                    <label
                        htmlFor="completed-proposals"
                        className="text-sm md:text-base"
                    >
                        {t('charts.completedProposals')}
                    </label>
                    <Checkbox
                        id="completed-proposals"
                        value="complete"
                        checked={
                            getFilter(ParamsEnum.COMPLETED_PROPOSALS)?.includes(
                                'complete',
                            ) || false
                        }
                        onChange={handleCompleteChange}
                        className="checked:bg-primary"
                    />
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                    <label
                        htmlFor="in-progress-proposals"
                        className="text-sm md:text-base"
                    >
                        {t('charts.inProgressProposals')}
                    </label>
                    <Checkbox
                        id="in-progress-proposals"
                        value="in_progress"
                        checked={
                            getFilter(ParamsEnum.IN_PROGRESS)?.includes(
                                'in_progress',
                            ) || false
                        }
                        onChange={handleInProgressChange}
                        className="checked:bg-primary"
                    />
                </div>
            </div>

            <div className="flex w-full items-center justify-between gap-2 pr-2">
                <label
                    htmlFor="submitted-proposals"
                    className="text-sm font-bold md:text-base"
                >
                    {t('charts.submittedProposals')}
                </label>
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
                />
            </div>
        </div>
    );
}