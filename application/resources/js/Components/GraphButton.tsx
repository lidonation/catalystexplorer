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
import { Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

const METRICS_BAR_STORAGE_KEY = 'cx-metrics-bar-visible';

const GraphButton = () => {
    const [activePopup, setActivePopup] = useState<null | "analytics" | "ai" | "chart">(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(METRICS_BAR_STORAGE_KEY);
            return saved === 'true' ? 'analytics' : null;
        }
        return null;
    });
    const [connectorOffset, setConnectorOffset] = useState(0);
    const { metrics } = useMetrics();
    const { t } = useLaravelReactI18n();

    const onProposals = usePage().component == 'Proposals/Index';

    const aiButtonRef = useRef<HTMLDivElement>(null);
    const chartButtonRef = useRef<HTMLDivElement>(null);
    const analyticsButtonRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const chartsUrl = useLocalizedRoute('charts.proposals');

    useEffect(() => {
        localStorage.setItem(METRICS_BAR_STORAGE_KEY, String(activePopup === 'analytics'));
    }, [activePopup]);

    useEffect(() => {
        if (!activePopup || !containerRef.current) return;

        let targetButton: HTMLDivElement | null = null;

        switch (activePopup) {
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
            <div className="lg:hidden">
                <div ref={containerRef} className="relative flex flex-col items-center">
                    <Transition
                        show={activePopup === "analytics"}
                        as="div"
                        className="absolute bottom-16 left-0 right-0 z-40 flex flex-col items-center"
                        enter="transition-all duration-300 ease-out"
                        enterFrom="opacity-0 translate-y-4"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition-all duration-200 ease-in"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-4"
                        afterLeave={() => setConnectorOffset(0)}
                    >
                        <Transition.Child
                            as="div"
                            enter="transition-all duration-300 ease-out delay-75"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="transition-all duration-200 ease-in"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                            className="w-full max-w-full mb-0"
                        >
                            {metrics && <MetricsBar isConnected={false} />}
                        </Transition.Child>

                        <motion.svg
                            key={`connector-${connectorOffset}`}
                            width={129}
                            height={42}
                            viewBox="0 177 129 27"
                            className="mx-auto -mt-4"
                            style={{ x: connectorOffset }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                                duration: 0.3
                            }}
                        >
                            <motion.rect
                                width="71"
                                height="29"
                                x="25"
                                y="177"
                                fill="var(--cx-background-gradient-2-dark)"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                    delay: 0.1
                                }}
                                style={{ transformOrigin: "center" }}
                            />
                            <motion.path
                                d="M32.5 230.5C23.9 187.1 7.66667 180.833 3.49693e-07 185L3.5 180L27.5 177L38 185L36 20C34.6667 203.5 31.1 207.9 37.5 197.5Z"
                                fill="var(--cx-background-gradient-2-dark)"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                    delay: 0.1
                                }}
                                stroke="var(--cx-background-gradient-2-dark)"
                                strokeWidth={0.5}
                            />

                            <motion.path
                                d="M93.5 230.5C105.1 187.1 121.333 185.833 129 185L125.5 180L101.5 177L91 185L93 200C94.3333 203.5 97.9 220.9 81.5 203.5Z"
                                fill="var(--cx-background-gradient-2-dark)"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                    delay: 0.1
                                }}
                                stroke="var(--cx-background-gradient-2-dark)"
                                strokeWidth={0.5}
                            />
                        </motion.svg>
                    </Transition>

                    {/* Icon buttons */}
                    <div className="flex justify-center gap-2">
                        <div ref={aiButtonRef}>
                            <IconButton
                                onClick={() => setActivePopup(activePopup === "ai" ? null : "ai")}
                                icon={<AIPromptIcon />}
                                aria-label="AI Assistant"
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
                                    aria-label="View charts"
                                />
                            )}
                        </div>

                        <div ref={analyticsButtonRef}>
                            <IconButton
                                onClick={() => setActivePopup(activePopup === "analytics" ? null : "analytics")}
                                icon={<AnalyticsIcon />}
                                aria-label="View analytics"
                                className={`cursor-pointer ${activePopup === "analytics"
                                        ? "bg-gradient-to-br from-[var(--cx-background-gradient-2-dark)] to-[var(--cx-background-gradient-2-dark)] bg-opacity-60 ring-2 ring-white/20"
                                        : "bg-gradient-to-br from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)] hover:scale-105"
                                    } transition-all duration-200 active:scale-95`}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="hidden lg:block relative h-0">
                <div className="absolute bottom-0 right-0 flex items-end justify-end z-10 -translate-y-20">
                    <Transition
                        show={activePopup === 'analytics'}
                        as="div"
                        className="flex items-end mb-2"
                        enter="transition-all duration-300 ease-out"
                        enterFrom="opacity-0 translate-x-4"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition-all duration-200 ease-in"
                        leaveFrom="opacity-100 translate-x-0"
                        leaveTo="opacity-0 translate-x-1"
                    >
                        <Transition.Child
                            as="div"
                            enter="transition-all duration-300 ease-out delay-100"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="transition-all duration-200 ease-in"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="relative">
                                {metrics && <MetricsBar isConnected={true} />}
                            </div>
                        </Transition.Child>
                    </Transition>

                    <div className="flex flex-col gap-2 ml-4">
                        <IconButton
                            onClick={() => setActivePopup(activePopup === 'ai' ? null : 'ai')}
                            icon={<AIPromptIcon />}
                            aria-label="AI Assistant"
                            className="hover:scale-105 transition-transform duration-200 active:scale-95 "
                        />
                        {onProposals ? (
                            <IconButton
                                href={chartsUrl}
                                icon={<GraphIcon />}
                                testId="proposals-charts-button"
                                aria-label="View charts"
                                className="transition-transform duration-200"
                            />
                        ) : (
                            <IconButton
                                onClick={() => setActivePopup(activePopup === 'chart' ? null : 'chart')}
                                icon={<GraphIcon />}
                                aria-label="View charts"
                                className="hover:scale-105 transition-transform duration-200"
                            />
                        )}
                        <IconButton
                            onClick={() => setActivePopup(activePopup === 'analytics' ? null : 'analytics')}
                            icon={<AnalyticsIcon />}
                            aria-label="View analytics"
                            connected={activePopup === 'analytics'}
                            className={`cursor-pointer ${activePopup === 'analytics'
                                    ? 'bg-gradient-to-br from-[var(--cx-background-gradient-2-dark)] to-[var(--cx-background-gradient-1-dark) '
                                    : 'bg-gradient-to-br from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]'
                                }`}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default GraphButton;
