import { useLocalizedRoute } from '@/utils/localizedRoute';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState, useRef, useEffect } from 'react';
import IconButton from './atoms/IconButton';
import GraphIcon from './svgs/GraphIcon';
import AnalyticsIcon from './svgs/AnalyticsIcon';
import AIPromptIcon from './svgs/AIPromptIcon';
import MetricsBar from '@/Pages/Proposals/Partials/MetricsBar';
import { useMetrics } from '@/Context/MetricsContext';

const GraphButton = () => {
    const [activePopup, setActivePopup] = useState<null | "analytics" | "ai" | "chart">(null);
    const [connectorOffset, setConnectorOffset] = useState(0);
    const { metrics } = useMetrics();
    const { t } = useLaravelReactI18n();

    const onProposals = usePage().component == 'Proposals/Index';

    const aiButtonRef = useRef<HTMLDivElement>(null);
    const chartButtonRef = useRef<HTMLDivElement>(null);
    const analyticsButtonRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [barHeight, setBarHeight] = useState(71);
    const [metricsBarBottom, setMetricsBarBottom] = useState(24);

    const chartsUrl = useLocalizedRoute('charts.proposals');

    // Calculate offset when activePopup changes
    useEffect(() => {
        if (!activePopup || !containerRef.current) return;

        let targetButton: HTMLDivElement | null = null;

        switch(activePopup) {
            case 'ai':
                targetButton = aiButtonRef.current;
                break;
            case 'chart':
                targetButton = chartButtonRef.current;
                break;
            case 'analytics':
                targetButton = analyticsButtonRef.current;
                break;
        }

        if (targetButton && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const buttonRect = targetButton.getBoundingClientRect();
            const containerCenter = containerRect.left + containerRect.width / 2;
            const buttonCenter = buttonRect.left + buttonRect.width / 2;
            const offset = buttonCenter - containerCenter;
            setConnectorOffset(offset);
        }
    }, [activePopup]);

    return (
        <>
            <div ref={containerRef} className="sticky bottom-2 left-0 right-0 z-0  flex justify-center gap-1.5 lg:hidden">
                {activePopup === "analytics" && metrics && (
                <div className="fixed bottom-2 left-0 right-0 flex flex-col items-center px-3 pointer-events-none z-50">
                    <div className="w-full max-w-full mb-0">
                        <MetricsBar isConnected={false} />
                    </div>
                    <svg
                        width={129}
                        height={40}
                        viewBox="0 177 129 24"
                        className="mx-auto transition-transform duration-300 -mt-4"
                        style={{ transform: `translateX(${connectorOffset}px)` }}
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <rect
                            width="71"
                            height="28"
                            x="25"
                            y="177"
                            fill="url(#paint0_linear_7395_41434)"
                        />
                        <path
                            d="M27.5 197.5C23.9 187.1 7.66667 184.833 3.49693e-07 185L3.5 180L27.5 177L38 185L36 200C34.6667 203.5 31.1 207.9 27.5 197.5Z"
                            fill="url(#paint1_linear_7395_41434)"
                        />
                        <path
                            d="M101.5 197.5C105.1 187.1 121.333 184.833 129 185L125.5 180L101.5 177L91 185L93 200C94.3333 203.5 97.9 207.9 101.5 197.5Z"
                            fill="url(#paint2_linear_7395_41434)"
                        />

                        <defs>
                            <linearGradient id="paint0_linear_7395_41434" x1="29" y1="177" x2="100" y2="177" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#475467"/>
                                <stop offset="0.997174" stopColor="#475467"/>
                            </linearGradient>
                            <linearGradient id="paint1_linear_7395_41434" x1="5.89804e-07" y1="190.493" x2="38" y2="190.493" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#475467"/>
                                <stop offset="1" stopColor="#435063"/>
                            </linearGradient>
                            <linearGradient id="paint2_linear_7395_41434" x1="129" y1="190.493" x2="91" y2="190.493" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#475467"/>
                                <stop offset="1" stopColor="#435063"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            )}
                <div ref={aiButtonRef}>
                    <IconButton
                        onClick={() => setActivePopup(activePopup === "ai" ? null : "ai")}
                        icon={<AIPromptIcon />}
                    />
                </div>

                <div ref={chartButtonRef}>
                    {onProposals ? (
                        <IconButton
                            href={chartsUrl}
                            icon={<GraphIcon />}
                            testId="proposals-charts-button"
                            aria-label="View charts"
                        />
                    ) : (
                        <IconButton
                            onClick={() => setActivePopup(activePopup === "chart" ? null : "chart")}
                            icon={<GraphIcon />}
                        />
                    )}
                </div>

                <div ref={analyticsButtonRef}>
                    <IconButton
                        onClick={() => setActivePopup(activePopup === "analytics" ? null : "analytics")}
                        icon={<AnalyticsIcon />}
                        aria-label="View analytics"
                        className={`cursor-pointer ${
                            activePopup === "analytics"
                                ? "bg-gradient-to-br from-[var(--cx-background-gradient-2-dark)] to-[var(--cx-background-gradient-2-dark)] bg-opacity-60"
                                : "bg-gradient-to-br from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]"
                        }`}
                    />
                </div>
            </div>

            <div className="absolute bottom-2 lg:-right-7 z-1 isolate hidden lg:flex items-end -translate-y-20">
                {activePopup === "analytics" && metrics && (
                    <div className="flex items-end">
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
                            aria-label="View charts"
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
                        aria-label="View analytics"
                        connected={activePopup === "analytics"}
                        className={`cursor-pointer ${activePopup === "analytics" ? "bg-opacity-100" : "bg-opacity-60"}`}
                    />
                </div>
            </div>
        </>
    );
};

export default GraphButton;
