import { useLocalizedRoute } from '@/utils/localizedRoute';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import IconButton from './atoms/IconButton';
import GraphIcon from './svgs/GraphIcon';
import AnalyticsIcon from './svgs/AnalyticsIcon';
import AIPromptIcon from './svgs/AIPromptIcon';
import MetricsBar from '@/Pages/Proposals/Partials/MetricsBar';
import { useMetrics } from '@/Context/MetricsContext';

const GraphButton = () => {
    const [activePopup, setActivePopup] = useState<null | "analytics" | "ai" | "chart">(null);
    const { metrics } = useMetrics();
    const { t } = useLaravelReactI18n();
    const onProposals = usePage().component == 'Proposals/Index';

    const chartsUrl = useLocalizedRoute('charts.proposals');

    return (
        <>
            <div className="sticky bottom-4 left-0 right-0 z-40 flex justify-center gap-2 lg:hidden">
                <IconButton
                    onClick={() => setActivePopup(activePopup === "ai" ? null : "ai")}
                    icon={<AIPromptIcon />}
                />
                {onProposals ? (
                    <IconButton
                        href={chartsUrl}
                        icon={<GraphIcon />}
                        testId="proposals-charts-button"
                    />
                ) : (
                    <IconButton
                        onClick={() => setActivePopup(activePopup === "chart" ? null : "chart")}
                        icon={<GraphIcon />}
                    />
                )}
                <IconButton
                    onClick={() => setActivePopup(activePopup === "analytics" ? null : "analytics")}
                    icon={<AnalyticsIcon />}
                    className={`cursor-pointer ${activePopup === "analytics" ? "bg-opacity-0" : "bg-opacity-0"}`}
                />
            </div>
            <div className="absolute bottom-4 lg:right-8 z-40 hidden lg:flex items-end -translate-y-20">
                {activePopup === "analytics" && metrics && (
                    <div className="flex items-end mb-2">
                        <MetricsBar isConnected={true} />
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    <IconButton
                        onClick={() => setActivePopup(activePopup === "ai" ? null : "ai")}
                        icon={<AIPromptIcon />}
                    />
                    {onProposals ? (
                        <IconButton
                            href={chartsUrl}
                            icon={<GraphIcon />}
                            testId="proposals-charts-button"
                        />
                    ) : (
                        <IconButton
                            onClick={() => setActivePopup(activePopup === "chart" ? null : "chart")}
                            icon={<GraphIcon />}
                        />
                    )}
                    <IconButton
                        onClick={() => setActivePopup(activePopup === "analytics" ? null : "analytics")}
                        icon={<AnalyticsIcon />}
                        connected={activePopup === "analytics"}
                        className={`cursor-pointer ${activePopup === "analytics" ? "bg-opacity-100" : "bg-opacity-60"}`}
                    />
                </div>
            </div>
            {activePopup === "analytics" && metrics && (
                <div className="sticky bottom-20 left-4 right-4 z-40 lg:hidden">
                    <MetricsBar isConnected={false} />
                </div>
            )}
        </>
    );
};

export default GraphButton;