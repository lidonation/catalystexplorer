import Title from '@/Components/atoms/Title';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface ProposalProjectStatusProps {
    project_length?: string | number;
    opensource?: boolean | string;
}

export default function ProposalProjectStatus({
    project_length,
    opensource,
}: ProposalProjectStatusProps) {
    const { t } = useLaravelReactI18n();

    const formatProjectLength = (length?: string | number): string => {
        if (!length) return t('notSet');

        if (typeof length === 'number') {
            const monthKey = length === 1 ? 'proposals.month' : 'proposals.months';
            return `${length} ${t(monthKey)}`;
        }

        return String(length);
    };

    const formatOpensource = (isOpensource?: boolean | string): string => {
        if (typeof isOpensource === 'boolean') {
            return isOpensource ? t('yes') : t('no');
        }

        if (typeof isOpensource === 'string') {
            const lowerValue = isOpensource.toLowerCase();
            if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') {
                return t('yes');
            }
            if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') {
                return t('no');
            }
            return isOpensource;
        }

        return t('notSet');
    };

    return (
        <section
            className="proposal-project-status mt-3 mb-2 border-b border-gray-200 pb-2"
            aria-labelledby="project-status-heading"
            data-testid="proposal-project-status"
        >
            <div className="grid grid-cols-1 gap-3 mt-2">
                {/* Project Length */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">
                        {t('proposals.projectLength')}:
                    </span>
                    <span
                        className="text-sm text-content font-semibold"
                        data-testid="project-length-value"
                    >
                        {formatProjectLength(project_length)}
                    </span>
                </div>

                {/* Open Source Status */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">
                        {t('proposals.openSource')}:
                    </span>
                    <span
                        className={`text-sm font-semibold ${
                            opensource === true || (typeof opensource === 'string' && ['true', 'yes', '1'].includes(opensource.toLowerCase()))
                                ? 'text-success'
                                : 'text-content'
                        }`}
                        data-testid="opensource-value"
                    >
                        {formatOpensource(opensource)}
                    </span>
                </div>
            </div>
        </section>
    );
}
