import Paragraph from '@/Components/atoms/Paragraph';
import ToolTipHover from '@/Components/ToolTipHover';
import { ResponsivePie } from '@nivo/pie';
import { useLaravelReactI18n } from 'laravel-react-i18n';

const PERCENT_FORMATTER = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export type PieChartDatum = {
    id: string;
    label: string;
    value: number;
    color: string;
    percentage: number;
};

type PieChartCardProps = {
    title: string;
    subtitle?: string;
    emptyMessage: string;
    data: PieChartDatum[];
    valueFormatter: (value: number) => string;
};

const PieChartCard = ({ title, subtitle, emptyMessage, data, valueFormatter }: PieChartCardProps) => {
    const { t } = useLaravelReactI18n();
    const hasData = data.length > 0;

    return (
        <div className="flex h-[360px] flex-col rounded-lg bg-background p-6 shadow-lg">
            <div className="mb-4">
                <Paragraph className="text-xl font-semibold text-content">{title}</Paragraph>
                {subtitle && (
                    <Paragraph className="text-sm text-content/70">{subtitle}</Paragraph>
                )}
            </div>
            {hasData ? (
                <div className="flex-1 min-h-0" style={{ height: '100%' }}>
                    <ResponsivePie
                        data={data}
                        margin={{ top: 30, right: 220, bottom: 30, left: 30 }}
                        innerRadius={0.45}
                        sortByValue
                        colors={{ datum: 'data.color' }}
                        enableArcLabels={false}
                        enableArcLinkLabels={false}
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
                            const percentage = datum.data?.percentage ?? 0;
                            const formattedPercentage = PERCENT_FORMATTER.format(percentage);

                            return (
                                <ToolTipHover
                                    props={t('charts.registrations.tooltip', {
                                        label: datum.label,
                                        percentage: formattedPercentage,
                                    })}
                                />
                            );
                        }}
                        legends={[
                            {
                                anchor: 'right',
                                direction: 'column',
                                justify: false,
                                translateX: 200,
                                translateY: 0,
                                itemsSpacing: 12,
                                itemWidth: 120,
                                itemHeight: 18,
                                itemTextColor: 'var(--cx-content)',
                                itemDirection: 'left-to-right',
                                symbolSize: 14,
                                symbolShape: 'circle',
                            },
                        ]}
                        valueFormat={(value) => valueFormatter(Number(value))}
                    />
                </div>
            ) : (
                <Paragraph className="text-sm text-content/70">{emptyMessage}</Paragraph>
            )}
        </div>
    );
};

export default PieChartCard;
