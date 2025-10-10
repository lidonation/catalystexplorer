import Card from '@/Components/Card';
import Paragraph from '@/Components/atoms/Paragraph';
import { ResponsivePie, type PieCustomLayer } from '@nivo/pie';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export type PieChartDatum = {
    id: string;
    label: string;
    value: number;
    color: string;
    percentage?: number;
};

type PieChartCardProps = {
    title: string;
    subtitle?: string;
    emptyMessage: string;
    data: PieChartDatum[];
    valueFormatter: (value: number) => string;
};

const PERCENT_FORMATTER = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const PieChartCard = ({
    title,
    subtitle,
    emptyMessage,
    data,
    valueFormatter,
}: PieChartCardProps) => {
    const hasData = data.length > 0;
    const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null);
    const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);
    const [showTooltipForSelected, setShowTooltipForSelected] = useState(false);
    const legendsRef = useRef<HTMLDivElement>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const activeSliceId = hoveredSliceId ?? selectedSliceId ?? null;
    const { t } = useLaravelReactI18n();

    const toggleSlice = useCallback((id: string) => {
        setSelectedSliceId((current) => {
            const newSelection = current === id ? null : id;
            setShowTooltipForSelected(newSelection !== null);
            return newSelection;
        });
    }, []);

    const handleSliceHover = useCallback((id: string | number | null) => {
        setHoveredSliceId(id ? String(id) : null);
    }, []);

    // Handle clicks outside legends to deselect
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (legendsRef.current && !legendsRef.current.contains(event.target as Node)) {
                setSelectedSliceId(null);
                setShowTooltipForSelected(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedTooltipLayer = useCallback<PieCustomLayer<PieChartDatum>>(
        ({ dataWithArc, centerX, centerY }) => {
            if (!showTooltipForSelected || !selectedSliceId) {
                return null;
            }

            const selectedDatum = dataWithArc.find((datum) => datum.data.id === selectedSliceId);
            if (!selectedDatum) {
                return null;
            }

            const datum = selectedDatum.data;
            const percentage = datum.percentage ?? 0;
            const formattedPercentage = PERCENT_FORMATTER.format(percentage);
            const formattedValue = valueFormatter(Number(datum.value));

            const lines = [
                {
                    text: String(datum.label).toUpperCase(),
                    fontSize: 11,
                    fontWeight: 600,
                    fill: 'var(--cx-background)',
                    fillOpacity: 0.7,
                    letterSpacing: '0.12em',
                },
                {
                    text: formattedValue,
                    fontSize: 15,
                    fontWeight: 600,
                    fill: 'var(--cx-background)',
                    fillOpacity: 0.95,
                    suffix: t('wallets'),
                },
                {
                    text: `${formattedPercentage}%`,
                    fontSize: 12,
                    fontWeight: 500,
                    fill: 'var(--cx-background)',
                    fillOpacity: 0.8,
                },
            ];

            const longestLineLength = lines.reduce((maxLength, line) => {
                const content = line.suffix ? `${line.text} ${line.suffix}` : line.text;
                return Math.max(maxLength, content.length);
            }, 0);
            const tooltipWidth = Math.max(128, Math.min(280, longestLineLength * 7 + 32));
            const paddingX = 14;
            const paddingY = 12;
            const rowHeight = 16;
            const rowGap = 4;
            const tooltipHeight = paddingY * 2 + lines.length * rowHeight + (lines.length - 1) * rowGap;

            const rawMidAngle = (selectedDatum.arc.startAngle + selectedDatum.arc.endAngle) / 2;
            const midAngle = rawMidAngle - Math.PI / 2;

            const outerRadius = selectedDatum.arc.outerRadius;
            const innerRadius = selectedDatum.arc.innerRadius ?? 0;
            const sliceThickness = Math.max(outerRadius - innerRadius, 0);
            const inwardOffset = Math.min(18, sliceThickness * 0.7);
            const minStartRadius = innerRadius + sliceThickness * 0.15;
            const lineStartRadius = Math.max(outerRadius - inwardOffset, minStartRadius);
            const lineMidRadius = outerRadius + 10;
            const labelRadius = outerRadius + 34;

            const startX = centerX + Math.cos(midAngle) * lineStartRadius;
            const startY = centerY + Math.sin(midAngle) * lineStartRadius;
            const midX = centerX + Math.cos(midAngle) * lineMidRadius;
            const midY = centerY + Math.sin(midAngle) * lineMidRadius;
            const anchorX = centerX + Math.cos(midAngle) * labelRadius;
            const anchorY = centerY + Math.sin(midAngle) * labelRadius;

            const isRightSide = Math.cos(midAngle) >= 0;
            const rectX = isRightSide ? anchorX : anchorX - tooltipWidth;
            const rectY = anchorY - tooltipHeight / 2;
            const textX = isRightSide ? rectX + paddingX : rectX + tooltipWidth - paddingX;
            const lineEndX = isRightSide ? rectX : rectX + tooltipWidth;
            const lineEndY = anchorY;
            const path = `M ${startX} ${startY} L ${midX} ${midY} L ${lineEndX} ${lineEndY}`;

            if (typeof document === 'undefined' || typeof window === 'undefined') {
                return null;
            }

            const chartBounds = chartContainerRef.current?.getBoundingClientRect();
            if (!chartBounds) {
                return null;
            }

            const { width, height, left, top } = chartBounds;

            return createPortal(
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    style={{
                        position: 'absolute',
                        left: left + window.scrollX,
                        top: top + window.scrollY,
                        overflow: 'visible',
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }}
                >
                    <path
                        d={path}
                        fill="none"
                        stroke={datum.color}
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                    <circle cx={lineEndX} cy={lineEndY} r={4} fill={datum.color} />
                    <rect
                        x={rectX}
                        y={rectY}
                        width={tooltipWidth}
                        height={tooltipHeight}
                        rx={12}
                        fill="var(--cx-tooltip-background)"
                        stroke={datum.color}
                        strokeOpacity={0.4}
                        strokeWidth={1}
                    />
                    {lines.map((line, index) => {
                        const yPosition = rectY + paddingY + index * (rowHeight + rowGap);

                        return (
                            <text
                                key={`${selectedDatum.data.id}-selected-label-${index}`}
                                x={textX}
                                y={yPosition}
                                fill={line.fill}
                                fillOpacity={line.fillOpacity}
                                fontSize={line.fontSize}
                                fontWeight={line.fontWeight}
                                letterSpacing={line.letterSpacing}
                                textAnchor={isRightSide ? 'start' : 'end'}
                                dominantBaseline="hanging"
                                style={{ textTransform: index === 0 ? 'uppercase' : undefined }}
                            >
                                {line.suffix ? `${line.text} ${line.suffix}` : line.text}
                            </text>
                        );
                    })}
                </svg>,
                document.body,
            );
        },
        [selectedSliceId, showTooltipForSelected, valueFormatter],
    );

    return (
        <Card className="relative flex flex-col overflow-visible bg-background p-6 shadow-lg md:h-[460px]">
            <header className="mb-4 space-y-1">
                <Paragraph className="text-xl font-semibold text-content">{title}</Paragraph>
                {subtitle ? (
                    <Paragraph className="text-sm text-content/70">{subtitle}</Paragraph>
                ) : null}
            </header>

            {hasData ? (
                <div className="relative flex min-h-0 flex-1 flex-col gap-8 md:h-full md:flex-row md:gap-10">
                    <div
                        className="relative z-20 min-h-[280px] flex-1 overflow-visible md:min-h-0 md:h-full md:flex-[2]"
                        ref={chartContainerRef}
                    >
                        <ResponsivePie
                            data={data}
                            margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
                            innerRadius={0.4}
                            sortByValue
                            colors={{ datum: 'data.color' }}
                            enableArcLabels={false}
                            enableArcLinkLabels={false}
                            activeOuterRadiusOffset={10}
                            activeInnerRadiusOffset={4}
                            activeId={activeSliceId}
                            onMouseEnter={({ data: datum }) => {
                                setSelectedSliceId(null);
                                handleSliceHover(datum.id);
                                setShowTooltipForSelected(false);
                            }}
                            onMouseLeave={() => {
                                handleSliceHover(null);
                                if (selectedSliceId) {
                                    setShowTooltipForSelected(true);
                                }
                            }}
                            layers={[
                                'arcs',
                                'arcLabels',
                                'arcLinkLabels',
                                'legends',
                                selectedTooltipLayer,
                            ]}
                            theme={{
                                text: {
                                    fill: 'var(--cx-content)',
                                    fontSize: 13,
                                },
                                tooltip: {
                                    container: {
                                        background: 'var(--cx-background)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--cx-border-color)',
                                        color: 'var(--cx-content)',
                                        padding: '0.75rem',
                                        boxShadow:
                                            '0 10px 25px -15px rgba(24, 39, 75, 0.3), 0 8px 12px -8px rgba(24, 39, 75, 0.25)',
                                    },
                                },
                            }}
                            tooltip={({ datum }) => {
                                // Only show tooltip on hover or when selected (not when hovering legend)
                                if (!hoveredSliceId && !showTooltipForSelected) {
                                    return null;
                                }

                                const percentage = datum.data?.percentage ?? 0;
                                const formattedPercentage = PERCENT_FORMATTER.format(percentage);
                                const formattedValue = valueFormatter(Number(datum.data?.value ?? 0));

                                return (
                                    <div className="bg-tooltip relative inline-flex flex-col rounded-lg px-4 py-3 text-sm text-white shadow-lg">
                                        <Paragraph className="font-semibold text-white whitespace-nowrap">
                                            {datum.label}
                                        </Paragraph>
                                        <Paragraph className="text-white/80 whitespace-nowrap">
                                            {formattedValue} {t('wallets')}
                                        </Paragraph>
                                        <Paragraph className="text-white/80 whitespace-nowrap">
                                            {formattedPercentage}%
                                        </Paragraph>
                                        <div className="border-t-white/70 absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-full border-t-[10px] border-r-[10px] border-l-[10px] border-r-transparent border-l-transparent" />
                                    </div>
                                );
                            }}
                            valueFormat={(value) => valueFormatter(Number(value))}
                        />
                    </div>

                    <div
                        className="relative z-10 mt-4 flex-shrink-0 md:mt-0 md:flex-1 md:h-full md:max-w-xs"
                        ref={legendsRef}
                    >
                        <div className="overflow-visible px-2 md:h-full md:overflow-y-auto md:px-0">
                            <ul className="grid grid-cols-2 gap-3 md:flex md:flex-col md:flex-nowrap">
                                {data.map((datum) => {
                                    const formattedValue = valueFormatter(Number(datum.value));
                                    const formattedPercentage = PERCENT_FORMATTER.format(
                                        datum.percentage ?? 0,
                                    );
                                    const isSelected = selectedSliceId === datum.id;

                                    return (
                                        <li
                                            key={datum.id}
                                            role="button"
                                            tabIndex={0}
                                            aria-pressed={isSelected}
                                            onClick={() => toggleSlice(datum.id)}
                                            onMouseEnter={() => handleSliceHover(datum.id)}
                                            onMouseLeave={() => handleSliceHover(null)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    toggleSlice(datum.id);
                                                }
                                            }}
                                            className={`flex cursor-pointer items-center justify-start gap-3 rounded-md bg-background-lighter/40 px-3 py-2 text-xs text-content transition md:w-full md:bg-transparent md:px-1 ${
                                                isSelected
                                                    ? 'border border-primary'
                                                    : 'hover:bg-background-lighter/60 md:hover:bg-transparent'
                                            }`}
                                        >
                                            <span
                                                aria-hidden
                                                className="h-3 w-3 flex-shrink-0 rounded-full"
                                                style={{ backgroundColor: datum.color }}
                                            />
                                            <div className="flex flex-1 flex-col items-start gap-1 md:flex-row md:items-center md:gap-2">
                                                <Paragraph className="font-semibold text-xs text-content whitespace-nowrap">
                                                    {datum.label}
                                                </Paragraph>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center">
                    <Paragraph className="text-sm text-content/70">{emptyMessage}</Paragraph>
                </div>
            )}
        </Card>
    );
};

export default PieChartCard;
