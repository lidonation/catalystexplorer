import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Paragraph from '@/Components/atoms/Paragraph';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import ModalLayout from '@/Layouts/ModalLayout';

interface ChartPageProps {
    // These will be provided by Inertia from the query parameters
    status?: string[] | string;
    chartType?: string;
}

interface MetricsData {
    filters: string[];
    initialChartType: string;
    selectedChartTypes: string[];
}

export default function ChartPage({ status, chartType }: ChartPageProps) {
    const { t } = useTranslation();
    const page = usePage();
    const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
    const [activeChartType, setActiveChartType] = useState<string>(chartType as string || '');
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const localizedMetricsRoute = useLocalizedRoute('proposals.chartsMetrics');
    const localizedBaseRoute = useLocalizedRoute('proposals.index');

    function handleChartDetailModalClose() {
        // Return to the base proposals route when closing
        router.get(localizedBaseRoute);
    }

    useEffect(() => {
        // Process the status filters from query params
        if (status) {
            // Convert to array if it's a single string
            const statusArray = Array.isArray(status) ? status : [status];
            setStatusFilters(statusArray);
        }
        
        // Try to get additional data from sessionStorage
        const storedData = sessionStorage.getItem('metricsData');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                setMetricsData(parsedData);
                
                // Set active chart type from stored data if not in URL
                if (!activeChartType && parsedData.selectedChartTypes && parsedData.selectedChartTypes.length > 0) {
                    setActiveChartType(parsedData.selectedChartTypes[0]);
                }
            } catch (error) {
                console.error("Error parsing metrics data:", error);
            }
        }
        
        setIsLoading(false);
    }, [status, chartType, activeChartType]);

    const handleEditMetrics = () => {
        router.get(localizedMetricsRoute);
    };

    const switchChartType = (chartType: string) => {
        setActiveChartType(chartType);
        
        // Update URL to reflect the new chart type without reloading the page
        const currentUrl = window.location.pathname;
        router.get(currentUrl, { chartType, status }, {
            preserveState: true,
            preserveScroll: true,
            only: [],
            replace: true
        });
    };

    // Render the appropriate chart based on the active chart type
    const renderChart = () => {
        switch (activeChartType) {
            case 'lineChart':
                return <div className="h-80 bg-gray-100 flex items-center justify-center">Line Chart Visualization</div>;
            case 'pieChart':
                return <div className="h-80 bg-gray-100 flex items-center justify-center">Pie Chart Visualization</div>;
            case 'barGraph':
                return <div className="h-80 bg-gray-100 flex items-center justify-center">Bar Graph Visualization</div>;
            case 'heatMap':
                return <div className="h-80 bg-gray-100 flex items-center justify-center">Heat Map Visualization</div>;
            case 'scatterPlots':
                return <div className="h-80 bg-gray-100 flex items-center justify-center">Scatter Plot Visualization</div>;
            case 'stackedBarCharts':
                return <div className="h-80 bg-gray-100 flex items-center justify-center">Stacked Bar Chart Visualization</div>;
            case 'trendChart':
                return <div className="h-80 bg-gray-100 flex items-center justify-center">Trend Chart Visualization</div>;
            default:
                return <div className="h-80 bg-gray-100 flex items-center justify-center">Select a chart type</div>;
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!statusFilters.length && !metricsData) {
        return (
            <div className="flex flex-col gap-4">
                <Title level="2">No Metrics Selected</Title>
                <Paragraph>No metrics data found. Please go back and select your metrics.</Paragraph>
                <PrimaryButton onClick={handleEditMetrics}>
                    Select Metrics
                </PrimaryButton>
            </div>
        );
    }

    const availableChartTypes = metricsData?.selectedChartTypes || [activeChartType].filter(Boolean);

    return (
        <ModalLayout onModalClosed={handleChartDetailModalClose}>
            <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <Title level="2">Chart Explorer</Title>
                <PrimaryButton onClick={handleEditMetrics}>
                    Edit Metrics
                </PrimaryButton>
            </div>

            <Card className="p-6">
                <div className="mb-6">
                    <Title level="3">Applied Filters</Title>
                    <div className="bg-gray-50 p-4 rounded mt-2">
                        <ul className="list-disc list-inside">
                            {statusFilters.map((filter, index) => (
                                <li key={index}>{filter}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                {availableChartTypes.length > 0 && (
                    <div className="mb-6">
                        <Title level="3">Available Chart Types</Title>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {availableChartTypes.map((chartType) => (
                                <button
                                    key={chartType}
                                    className={`px-4 py-2 rounded ${
                                        activeChartType === chartType 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                    onClick={() => switchChartType(chartType)}
                                >
                                    {t(`proposals.charts.${chartType}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border rounded p-4">
                    <Title level="3" className="mb-4">
                        {activeChartType ? t(`proposals.charts.${activeChartType}`) : 'Chart'}
                    </Title>
                    {renderChart()}
                </div>
                
                <div className="mt-6">
                    <PrimaryButton className="w-full">Export Chart</PrimaryButton>
                </div>
            </Card>
        </div>
        </ModalLayout>
    );
}