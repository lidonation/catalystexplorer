import { useLocalizedRoute } from '@/utils/localizedRoute';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import IconButton from './atoms/IconButton';
import GraphIcon from './svgs/GraphIcon';
import AnalyticsIcon from './svgs/AnalyticsIcon';
import AIPromptIcon from './svgs/AIPromptIcon';

// Add props to receive toggle function
type GraphButtonProps = {
    onAnalyticsClick?: () => void;
    showMetricsBar?: boolean;
};

const GraphButton = ({ onAnalyticsClick, showMetricsBar = true }: GraphButtonProps) => {
    const { t } = useLaravelReactI18n();
    const onProposals = usePage().component == 'Proposals/Index';

    return (
        <>
            {onProposals && (
                <div className="flex lg:flex-col lg:items-end lg:gap-0 gap-1 ">
                    {/* AI Prompt Button */}
                    <IconButton
                        href={useLocalizedRoute('charts.proposals')}
                        icon={<AIPromptIcon />}
                        testId="ai-prompt-button"
                    />
                    {/* Graph Chart Button */}
                    <IconButton
                        href={useLocalizedRoute('charts.proposals')}
                        icon={<GraphIcon />}
                        testId="proposals-charts-button"
                    />
                    
                    {/* Analytics Button - Toggles MetricsBar */}
                    <IconButton
                        onClick={onAnalyticsClick}
                        icon={<AnalyticsIcon />}
                        className={!showMetricsBar ? 'bg-opacity-60' : ''}
                        testId="analytics-toggle-button"
                    />

                </div>
            )}
        </>
    );
};

export default GraphButton;