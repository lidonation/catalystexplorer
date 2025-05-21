import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import { FiltersProvider } from '@/Context/FiltersContext';
import ModalLayout from '@/Layouts/ModalLayout';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchParams } from '../../../types/search-params';
import Step1 from './Partials/Step1';
import Step2 from './Partials/Step2';
import Step3 from './Partials/Step3';

interface PageProps {
    filters: SearchParams;
}

const Index = ({ filters }: PageProps) => {
    const { t } = useTranslation();
    const [canShowModal, setCanShowModal] = useState(false);
    const [selectedStatusFilters, setSelectedStatusFilters] = useState<
        string[]
    >([]);
    const [selectedChartType, setSelectedChartType] = useState('trendChart');
    const [selectedChartTypes, setSelectedChartTypes] = useState<string[]>([
        'trendChart',
    ]);
    const [isStep2Disabled, setIsStep2Disabled] = useState(true);
    const [isStep3Disabled, setIsStep3Disabled] = useState(true);
    const [closeModal, setCloseModal] = useState<() => void>(() => () => {});

    const localizedRoute = useLocalizedRoute('proposals.charts');

    useEffect(() => {
        const unlisten = router.on('finish', () => {
            setCanShowModal(true);
        });

        return () => unlisten();
    }, []);

    function handleChartDetailModalClose() {
        // First set modal visibility to false
        setCanShowModal(false);

        // Then give a small delay before navigation
        setTimeout(() => {
            router.get(localizedRoute);
        }, 100);
    }

    useEffect(() => {
        setIsStep2Disabled(selectedStatusFilters.length === 0);
    }, [selectedStatusFilters]);

    useEffect(() => {
        const shouldEnableStep3 =
            selectedStatusFilters.length > 0 &&
            selectedChartType === 'trendChart';
        setIsStep3Disabled(!shouldEnableStep3);
    }, [selectedStatusFilters, selectedChartType]);

    const handleChartTypesSelected = (chartTypes: string[]) => {
        setSelectedChartTypes(chartTypes);
    };

    // Function to skip to charts when a non-trendChart is selected in Step 2
    const handleStep2Complete = () => {
        // Only proceed to charts if we're not using trendChart
        if (
            selectedChartType !== 'trendChart' &&
            selectedStatusFilters.length > 0
        ) {
            handleExploreCharts();
        }
    };

    // This can be called from Step2 component
    const setChartTypeAndCheckTransition = (chartType: string) => {
        setSelectedChartType(chartType);

        // If we've selected a non-trendChart and we have filters
        if (chartType !== 'trendChart' && selectedStatusFilters.length > 0) {
            // Short timeout to allow state to update
            setTimeout(() => {
                handleExploreCharts();
            }, 100);
        }
    };

    const handleExploreCharts = () => {
        // Create metrics data object for storage
        const metricsData = {
            filters: selectedStatusFilters,
            initialChartType: selectedChartType,
            selectedChartTypes: selectedChartTypes,
        };

        sessionStorage.setItem('metricsData', JSON.stringify(metricsData));

        const queryParams: Record<string, string | string[]> = {
            status: selectedStatusFilters,
            chartType: selectedChartType,
        };

        // First set modal visibility to false
        setCanShowModal(false);

        // Then give a small delay before navigation
        if (closeModal) closeModal();
        setTimeout(() => {
          router.get(localizedRoute)
            
        }, 100);
    };

    return (
        canShowModal && (
            <ModalLayout onModalClosed={handleChartDetailModalClose} setCloseModal={setCloseModal}>
                <FiltersProvider defaultFilters={filters}>
                    <div className="flex flex-col gap-4">
                        <Title level="2">Select your metrics</Title>
                        <Card className="flex flex-col gap-6 p-8">
                            <Step1
                                selectedStatusFilters={selectedStatusFilters}
                                setSelectedStatusFilters={
                                    setSelectedStatusFilters
                                }
                            />

                            <div
                                className={isStep2Disabled ? 'opacity-50' : ''}
                            >
                                <Step2
                                    isDisabled={isStep2Disabled}
                                    selectedChartType={selectedChartType}
                                    setSelectedChartType={
                                        setChartTypeAndCheckTransition
                                    }
                                />
                            </div>

                            <div
                                className={isStep3Disabled ? 'opacity-50' : ''}
                            >
                                <Step3
                                    isDisabled={isStep3Disabled}
                                    onChartTypesSelected={
                                        handleChartTypesSelected
                                    }
                                    onExploreCharts={handleExploreCharts}
                                />
                            </div>
                        </Card>
                    </div>
                </FiltersProvider>
            </ModalLayout>
        )
    );
};

export default Index;
