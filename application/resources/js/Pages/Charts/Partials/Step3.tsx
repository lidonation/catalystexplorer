import Paragraph from "@/Components/atoms/Paragraph";
import Selector from "@/Components/atoms/Selector";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import PrimaryButton from "@/Components/atoms/PrimaryButton";

interface Step3Props {
  isDisabled?: boolean;
  onChartTypesSelected?: (chartTypes: string[]) => void;
  onExploreCharts?: () => void;
}

export default function Step3({ isDisabled, onChartTypesSelected, onExploreCharts }: Step3Props) {
  const { t } = useTranslation();
  // Initialize state with "trendChart" already selected
  const [selectedChartTypes, setSelectedChartTypes] = useState<string[]>(["trendChart"]);
  
  // Notify parent component when chart types change
  useEffect(() => {
    if (onChartTypesSelected && !isDisabled) {
      onChartTypesSelected(selectedChartTypes);
    }
  }, [selectedChartTypes, onChartTypesSelected, isDisabled]);

  // Handle chart type selection
  const handleChartTypeSelection = (values: string | string[]) => {
    if (Array.isArray(values)) {
      setSelectedChartTypes(values);
    } else {
      setSelectedChartTypes([values]);
    }
  };

  // Handle explore charts button click
  const handleExploreChartsClick = () => {
    if (onExploreCharts) {
      onExploreCharts();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Paragraph>
          Select Chart Type <span>{`(Select all that apply)`}</span>
        </Paragraph>
        <Selector
          isMultiselect={true}
          options={[
            {
              value: 'lineChart',
              label: t('proposals.charts.lineChart'),
            },
            {
              value: 'pieChart',
              label: t('proposals.charts.pieChart'),
            },
            {
              value: 'barGraph',
              label: t('proposals.charts.barGraph'),
            },
            {
              value: 'heatMap',
              label: t('proposals.charts.heatMap'),
            },
            {
              value: 'scatterPlots',
              label: t('proposals.charts.scatterPlots'),
            },
            {
              value: 'stackedBarCharts',
              label: t('proposals.charts.stackBarCharts'),
            },
          ]}
          setSelectedItems={handleChartTypeSelection}
          selectedItems={selectedChartTypes}
          placeholder='Select'
          disabled={isDisabled}
        />
      </div>
      <div>
        <PrimaryButton 
          className='w-full' 
          disabled={isDisabled || selectedChartTypes.length === 0}
          onClick={handleExploreChartsClick}
        >
          Explore Charts
        </PrimaryButton>
      </div>
    </div>
  );
}