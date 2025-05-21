import { FiltersProvider } from '@/Context/FiltersContext';
import ModalLayout from '@/Layouts/ModalLayout';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchParams } from '../../../types/search-params';
import SetMetrics from './Partials/SetMetrics';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import Step1 from './Partials/Step1';
import Step2 from './Partials/Step2';
import Step3 from './Partials/Step3';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import ModalNavLink from '@/Components/ModalNavLink';
import Charts from './Charts';

interface PageProps {
    filters: SearchParams;
}

const Index = ({ filters }: PageProps) => {
    const { t } = useTranslation();
    const [canShowModal, setCanShowModal] = useState(false);
    const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([]);
    const [selectedChartType, setSelectedChartType] = useState('trendChart');
    const [selectedChartTypes, setSelectedChartTypes] = useState<string[]>(['trendChart']);
    const [isStep2Disabled, setIsStep2Disabled] = useState(true);
    const [isStep3Disabled, setIsStep3Disabled] = useState(true);
    const modalRef = useRef<{ close: () => void }>(null);
    
    const localizedRoute = useLocalizedRoute('proposals.charts');

    // useEffect(() => {
    //     const unlisten = router.on('finish', () => {
    //         setCanShowModal(true);
    //     });

    //     return () => unlisten();
    // }, []);
    
    function handleChartDetailModalClose() {
        modalRef.current?.close();
    }

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

    const handleExploreCharts = () => {
        // // Create metrics data object
        // const metricsData = {
        //     filters: selectedStatusFilters,
        //     initialChartType: selectedChartType,
        //     selectedChartTypes: selectedChartTypes
        // };
        
        // // Store in sessionStorage
        // sessionStorage.setItem('metricsData', JSON.stringify(metricsData));
        
        handleChartDetailModalClose();
        
        // Navigate after a short delay to ensure modal closes smoothly
        // setTimeout(() => {
        //     router.get(localizedRoute);
        // }, 100);
    };

    return (
        <ModalLayout onModalClosed={handleChartDetailModalClose}>
                <FiltersProvider defaultFilters={filters}>
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
                                    onExploreCharts={handleChartDetailModalClose}
                                />
                            </div>
                        </Card>
                    </div>
                </FiltersProvider>
            </ModalLayout>
    );
};

export default Index;