import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import ChartFilter from '@/Components/ChartFilter';
import ArrowTrendingDown from '@/Components/svgs/ArrowTrendingDown';
import ArrowTrendingUp from '@/Components/svgs/ArrowTrendingUp';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveLine } from '@nivo/line';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserSummaryChartProps {
    graphData?: {
        id: string;
        data: {
            x: number;
            y: number;
        }[];
    }[];
    title: string;
}

interface Option {
    label: string;
    value: string;
    selected: boolean;
}

export default function UserSummaryChart({
    graphData = [],
    title,
}: UserSummaryChartProps) {
    const { t } = useTranslation();

    const filters = [...graphData.map((item) => item.id)];
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([
        filters[0],
    ]);

    const currencyOptions = (): Option[] => {
        const labelMap: Record<string, string> = {
            usd: t('totalUsd'),
            ada: t('totalAda'),
        };

        return filters.map((curr) => ({
            label: labelMap[curr] || curr.toUpperCase(),
            value: curr,
            selected: selectedCurrencies.includes(curr),
        }));
    };

    const filteredData = useMemo(() => {
        return graphData.filter((entry) =>
            selectedCurrencies.includes(entry.id),
        );
    }, [graphData, selectedCurrencies]);

    const calculateTrend = (current: number, previous: number) => {
        if (previous !== 0) {
            const diff = ((current - previous) / previous) * 100;
            return { value: Math.abs(diff).toFixed(0), isPositive: diff >= 0 };
        }
        return { value: '0', isPositive: true };
    };

    const allYValues = filteredData.flatMap((series) =>
        series.data.map((d) => d.y),
    );
    const maxY = Math.max(...allYValues, 0);
    const interval = 40000;
    const tickValues = Array.from(
        { length: Math.ceil(maxY / interval) + 1 },
        (_, i) => i * interval,
    );

    return (
        <Card className="flex h-full min-h-64 flex-col gap-4">
            <div className="border-content-light flex items-center justify-between border-b pb-4">
                <Title
                    level="4"
                    className="text-content-gray-persist font-medium font-semibold"
                >
                    {t(title)}
                </Title>
                <div className="flex items-center gap-2">
                    <span className="text-dark text-sm font-semibold">
                        {t('filterChart')}
                    </span>
                    <ChartFilter
                        variants={currencyOptions()}
                        value={selectedCurrencies}
                        onChange={setSelectedCurrencies}
                    />
                </div>
            </div>
            <div className="h-full w-full">
                <ResponsiveLine
                    data={filteredData}
                    curve="cardinal"
                    margin={{
                        top: 10,
                        right: 30,
                        bottom: 40,
                        left: 50,
                    }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 0,
                        max: 'auto',
                        clamp: true,
                    }}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        legend: '',
                        legendOffset: 0,
                    }}
                    axisLeft={{
                        tickValues,
                        tickSize: 0,
                        tickPadding: 4,
                        legend: t('amount'),
                        legendOffset: -40,
                        legendPosition: 'middle',
                        format: (value) => shortNumber(Number(value)),
                    }}
                    enableGridX={false}
                    enableGridY={true}
                    pointSize={4}
                    pointColor={{
                        from: 'color',
                        modifiers: [['brighter', 1.5]],
                    }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    useMesh={true}
                    enableArea={true}
                    areaOpacity={0.8}
                    crosshairType="x"
                    defs={[
                        {
                            id: 'gradient',
                            type: 'linearGradient',
                            colors: [
                                {
                                    offset: 0,
                                    color: 'inherit',
                                    opacity: 1.0,
                                },
                                {
                                    offset: 1,
                                    color: 'inherit',
                                    opacity: 0.2,
                                },
                            ],
                        },
                    ]}
                    fill={[{ match: '*', id: 'gradient' }]}
                    tooltip={({ point }) => {
                        const { serieId, index, data } = point;
                        const currentLine = filteredData.find(
                            (line) => line.id === serieId,
                        );
                        const current = currentLine?.data[index]?.y ?? 0;
                        const previous = currentLine?.data[index - 1]?.y ?? 0;
                        const trend = calculateTrend(current, previous);

                        return (
                            <div className="bg-tooltip relative rounded-lg p-4 text-white shadow-lg">
                                <div className="max-w-sm">
                                    <Title
                                        level="3"
                                        className="text-lg font-semibold"
                                    >
                                        {data.xFormatted}
                                    </Title>
                                    <Paragraph className="mt-2 flex items-center text-sm">
                                        <span className="text-capitalize mr-1 truncate">
                                            {`${t('amount')} ${serieId}`}
                                        </span>
                                        :
                                        <span className="ml-1 font-bold">
                                            {shortNumber(current, 2)}
                                        </span>
                                    </Paragraph>
                                    <div className="mt-2 flex items-center">
                                        <span
                                            className={
                                                trend.isPositive
                                                    ? 'text-green-500'
                                                    : 'text-red-500'
                                            }
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {trend.isPositive ? (
                                                <ArrowTrendingUp />
                                            ) : (
                                                <ArrowTrendingDown />
                                            )}
                                            <span className="ml-1 font-medium">
                                                {trend.value}%
                                            </span>
                                        </span>
                                        <span className="ml-1">
                                            {t('metric.vs')}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t-dark absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-full border-t-[10px] border-r-[10px] border-l-[10px] border-r-transparent border-l-transparent"></div>
                            </div>
                        );
                    }}
                    theme={{
                        grid: {
                            line: {
                                stroke: 'var(--cx-content-gray-persist)',
                                strokeWidth: 1,
                                strokeOpacity: 0.1,
                            },
                        },
                        axis: {
                            domain: {
                                line: {
                                    stroke: 'var(--cx-border-color)',
                                    strokeWidth: 1,
                                },
                            },
                            legend: {
                                text: {
                                    fill: 'var(--cx-content-gray-persist)',
                                    fontSize: 16,
                                },
                            },
                            ticks: {
                                text: {
                                    fill: 'var(--cx-content-gray-persist)',
                                    fontSize: 10,
                                },
                            },
                        },
                        tooltip: {
                            container: {
                                background: 'var(--cx-background)',
                                color: 'var(--cx-content)',
                                fontSize: 12,
                            },
                        },
                    }}
                />
            </div>
        </Card>
    );
}
