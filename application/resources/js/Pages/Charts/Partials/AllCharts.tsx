import Title from '@/Components/atoms/Title';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import BarChart from './Barchart';
import PieChart from './PieChart';
import LineChart from './LineChart';
import ScatterPlot from './ScatterPlots';
import StackedBarChart from './StackedBarChart';
import Heatmap from './HeatMap';


interface AllChartsProps {
    chartData: any;
}

export default function AllCharts({ chartData }: AllChartsProps) {
    const { getFilter } = useFilterContext();
    const selectedChartOptions = getFilter(ParamsEnum.CHART_OPTIONS) || [];

    const renderBarChart = () => (
        <div>
           <BarChart chartData={chartData} />
        </div>
    );

    const renderPieChart = () => (
        <div>
           <PieChart chartData={chartData}/>
        </div>
    );

    const renderLineChart = () => (
        <div>
           <LineChart chartData={chartData} />
        </div>
    );

    const renderHeatMap = () => (
        <div>
            <Heatmap chartData={chartData} title='Heatmap'/>
        </div>
    );

    const renderScatterPlots = () => (
        <div>
            <ScatterPlot chartData={chartData} title='Scatter Plot'/>
        </div>
    );

    const renderStackedBarCharts = () => (
       <div>
           <StackedBarChart chartData={chartData} />
        </div>
    );

    const chartRenderers = {
        barChart: renderBarChart,
        pieChart: renderPieChart,
        lineChart: renderLineChart,
        heatMap: renderHeatMap,
        scatterPlots: renderScatterPlots,
        stackedBarCharts: renderStackedBarCharts,
    };

    return (
        <div>
            <Title level="2" className="mb-4 font-bold">
                Explore Charts
            </Title>

            {selectedChartOptions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    No chart options selected. Please go back and select chart
                    types.
                </div>
            ) : (
                <div className="space-y-6 px-6">
                    {selectedChartOptions.map((chartType: string) => {
                        const renderer =
                            chartRenderers[
                                chartType as keyof typeof chartRenderers
                            ];
                        return renderer ? (
                            <div key={chartType}>{renderer()}</div>
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
}
