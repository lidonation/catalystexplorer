import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import InformationIcon from '@/Components/svgs/InformationIcon';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/useHooks/useUserSettings';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useMemo, useState } from 'react';

interface Step1Props {
    onCompletionChange?: (isComplete: boolean) => void;
    onRulesChange?: (rules: string[]) => void;
}

export default function Step1({
    onCompletionChange,
    onRulesChange,
}: Step1Props) {
    const { t } = useLaravelReactI18n();
    const [rules, setRules] = useState<string[]>([]);

    const { value: proposalTypes, setValue: setProposalTypes } = useUserSetting<
        string[]
    >(userSettingEnums.PROPOSAL_TYPE, []);

    const isComplete = useMemo(() => {
        return (proposalTypes?.length ?? 0) > 0;
    }, [proposalTypes]);

    useEffect(() => {
        onCompletionChange?.(isComplete);
        onRulesChange?.(rules);
    }, [isComplete, onCompletionChange, rules, onRulesChange]);

    useEffect(() => {
        const mapping = [
            { type: 'submitted', label: 'Submitted Proposals' },
            { type: 'approved', label: 'Funded Proposals' },
            { type: 'complete', label: 'Completed Proposals' },
            { type: 'unfunded', label: 'Unfunded Proposals' },
            { type: 'in_progress', label: 'In Progress Proposals' },
        ];

        const activeLabels: string[] = [];
        mapping.forEach(({ type, label }) => {
            if (proposalTypes?.includes(type)) {
                activeLabels.push(label);
            }
        });

        setRules(activeLabels);
    }, [proposalTypes, t]);

    const handleSubmittedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const current = proposalTypes ?? [];
        const currentRules = rules ?? [];
        const label = t('charts.submittedProposals');

        if (isChecked) {
            setProposalTypes(['submitted']);
            setRules([label]);
        } else {
            const updated = current.filter((item) => item !== 'submitted');
            setProposalTypes(updated);
            setRules(currentRules.filter((rule) => rule !== label));
        }
    };

    const handleUnfundedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const current = proposalTypes ?? [];
        const currentRules = rules ?? [];
        const label = t('charts.unfundedProposals');

        if (isChecked) {
            const updated = current
                .filter((item) => item !== 'submitted')
                .concat('unfunded');
            setProposalTypes([...new Set(updated)]);
            const updatedRules = [...new Set([...currentRules, label])];
            setRules(updatedRules);
        } else {
            const updated = current.filter((item) => item !== 'unfunded');
            setProposalTypes(updated);
            setRules(currentRules.filter((rule) => rule !== label));
        }
    };

    const handleFundedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const current = proposalTypes ?? [];

        if (isChecked) {
            const updated = current
                .filter(
                    (item) =>
                        item !== 'submitted' &&
                        item !== 'complete' &&
                        item !== 'in_progress',
                )
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
                    checked={proposalTypes?.includes('unfunded') || false}
                    onChange={handleUnfundedChange}
                    className="checked:bg-primary"
                    data-testid="unfunded-proposals-checkbox"
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
                        checked={proposalTypes?.includes('approved') || false}
                        onChange={handleFundedChange}
                        className="checked:bg-primary"
                        data-testid="approved-proposals-checkbox"
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
                        checked={proposalTypes?.includes('complete') || false}
                        onChange={handleCompleteChange}
                        className="checked:bg-primary"
                        data-testid="completed-proposals-checkbox"
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
                            proposalTypes?.includes('in_progress') || false
                        }
                        onChange={handleInProgressChange}
                        className="checked:bg-primary"
                        data-testid="in-progress-proposals-checkbox"
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
                    checked={proposalTypes?.includes('submitted') || false}
                    onChange={handleSubmittedChange}
                    className="checked:bg-primary"
                    data-testid="submitted-proposals-checkbox"
                />
            </div>
        </div>
    );
}
