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
            {/* Mobile View */}
            <div className="sticky bottom-4 left-0 right-0 z-40 flex justify-center gap-2 lg:hidden">
    {/* Analytics Button with Funnel Popup - Mobile */}
    {activePopup === "analytics" && metrics && (
        <div className="fixed bottom-24 left-0 right-0 flex flex-col items-center px-2 pointer-events-none">
            {/* Bar (top) */}
            <div className="mb-0 w-full max-w-full">
                <MetricsBar isConnected={false} />
            </div>
            <svg
                width={129}
                height={120}
                viewBox="0 120 129 91"
                preserveAspectRatio="xMidYMax meet"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto"
            >
                <defs>
                    <linearGradient
                        id="mobileConnectorBar"
                        x1="3.69794"
                        y1="60.6458"
                        x2="213.229"
                        y2="57.6833"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#182230" />
                        <stop offset="0.997174" stopColor="#475467" />
                    </linearGradient>
                    <linearGradient
                        id="mobileConnectorCurveLeft"
                        x1="5.89804e-07"
                        y1="190.493"
                        x2="38"
                        y2="190.493"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#475467" />
                        <stop offset="1" stopColor="#435063" />
                    </linearGradient>
                    <linearGradient
                        id="mobileConnectorCurveRight"
                        x1="129"
                        y1="190.493"
                        x2="91"
                        y2="190.493"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#475467" />
                        <stop offset="1" stopColor="#435063" />
                    </linearGradient>
                </defs>
                <rect
                    width="211"
                    height="71"
                    transform="translate(100 3.10351e-06) rotate(90)"
                    fill="url(#mobileConnectorBar)"
                />
                <path
                    d="M27.5 197.5C23.9 187.1 7.66667 184.833 3.49693e-07 185L3.5 180L27.5 177L38 185L36 200C34.6667 203.5 31.1 207.9 27.5 197.5Z"
                    fill="url(#mobileConnectorCurveLeft)"
                />
                <path
                    d="M101.5 197.5C105.1 187.1 121.333 184.833 129 185L125.5 180L101.5 177L91 185L93 200C94.3333 203.5 97.9 207.9 101.5 197.5Z"
                    fill="url(#mobileConnectorCurveRight)"
                />
            </svg>
        </div>
    )}
    
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
    
    {/* Analytics Icon Button */}
    <IconButton
        onClick={() => setActivePopup(activePopup === "analytics" ? null : "analytics")}
        icon={<AnalyticsIcon />}
        className={`cursor-pointer ${activePopup === "analytics" ? "bg-opacity-100" : "bg-opacity-60"}`}
    />
</div>
            {/* </div> */}

            {/* Desktop View */}
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
        </>
    );
};

export default GraphButton;