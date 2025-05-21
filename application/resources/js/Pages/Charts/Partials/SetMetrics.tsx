import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';

export default function SetMetrics() {
  const { t } = useTranslation();
  
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([]);
  const [selectedChartType, setSelectedChartType] = useState('trendChart');
  const [selectedChartTypes, setSelectedChartTypes] = useState<string[]>(['trendChart']);
  const [isStep2Disabled, setIsStep2Disabled] = useState(true);
  const [isStep3Disabled, setIsStep3Disabled] = useState(true);

  useEffect(() => {
    setIsStep2Disabled(selectedStatusFilters.length === 0);
  }, [selectedStatusFilters]);

  useEffect(() => {
    const shouldEnableStep3 =
      selectedStatusFilters.length > 0 && selectedChartType === 'trendChart';
    setIsStep3Disabled(!shouldEnableStep3);
  }, [selectedStatusFilters, selectedChartType]);

  const handleChartTypesSelected = (chartTypes: string[]) => {
    setSelectedChartTypes(chartTypes);
  };

  const localizedRoute = useLocalizedRoute('proposals.charts')
  const handleExploreCharts = () => {
    const metricsData = {
      filters: selectedStatusFilters,
      initialChartType: selectedChartType,
      selectedChartTypes: selectedChartTypes
    };
    
    sessionStorage.setItem('metricsData', JSON.stringify(metricsData));
    
    router.get(localizedRoute)
  };

  return (
    <div className="flex flex-col gap-4">
      <Title level="2">Select your metrics</Title>
      <Card className="flex flex-col gap-6 p-8">
        <Step1
          selectedStatusFilters={selectedStatusFilters}
          setSelectedStatusFilters={setSelectedStatusFilters}
        />

        <div className={isStep2Disabled ? 'opacity-50' : ''}>
          <Step2
            isDisabled={isStep2Disabled}
            selectedChartType={selectedChartType}
            setSelectedChartType={setSelectedChartType}
          />
        </div>

        <div className={isStep3Disabled ? 'opacity-50' : ''}>
          <Step3 
            isDisabled={isStep3Disabled}
            onChartTypesSelected={handleChartTypesSelected}
            onExploreCharts={handleExploreCharts}
          />
        </div>
      </Card>
    </div>
  );
}