import TabNavigation from '@/Components/TabNavigation';
import Selector from '@/Components/atoms/Selector';
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import { FiltersProvider } from '@/Context/FiltersContext';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { SearchParams } from '@/types/search-params';
import { generateTabs, chartsAllContentTabs } from '@/utils/routeTabs';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ReactNode, useEffect, useMemo, useState } from 'react';

interface PageProps extends InertiaPageProps {
    url: string;
    [key: string]: any;
}

interface FundOption {
    id: string | number;
    title: string;
    amount?: number;
}

interface AllChartsLayoutProps {
    children: ReactNode;
    fund: App.DataTransferObjects.FundData;
    funds?: FundOption[];
    filters?: SearchParams;
}

function LayoutContent({
    children,
    fund,
    funds = [],
}: Omit<AllChartsLayoutProps, 'filters'>) {
    const { t } = useLaravelReactI18n();
    const { url } = usePage<PageProps>().props;
    const { setFilters, getFilter } = useFilterContext();
    const [activeTab, setActiveTab] = useState('');

    const tabConfig = useMemo(() => chartsAllContentTabs, []);

    const tabs = useMemo(() => generateTabs(t, tabConfig), [t, tabConfig]);

    useEffect(() => {
        const currentPath = window.location.pathname.replace(/\/$/, '');

        const matchingTab = tabs.find((tab) => {
            const cleanTabPath = tab.href.replace(/\/$/, '');
            return currentPath.endsWith(cleanTabPath);
        });

        if (matchingTab) {
            setActiveTab(matchingTab.name);
        }
    }, [tabs, url]);

    const selectedFundId = useMemo(() => {
        const filter = getFilter(ParamsEnum.FUNDS);
        if (Array.isArray(filter) && filter.length > 0) {
            return String(filter[0]);
        }

        if (filter) {
            return String(filter);
        }

        return fund?.id ?? '';
    }, [getFilter, fund?.id]);

    const handleFundSelect = (value: string | string[]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
            setFilters({
                param: ParamsEnum.FUNDS,
                label: 'Funds',
                value: null,
            });
            return;
        }

        const selectedValue = Array.isArray(value) ? value[0] : value;

        setFilters({
            param: ParamsEnum.FUNDS,
            label: 'Funds',
            value: [selectedValue],
        });
    };

    const fundOptions = useMemo(() => {
        if (!funds?.length) return [];
        return funds.map((fundOption) => ({
            id: String(fundOption.id),
            title: fundOption.title,
        }));
    }, [funds]);

    return (
        <div className="min-h-screen container">
            <div className="mx-auto flex w-full flex-col gap-6 py-4">
                <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div className="space-y-2">
                        <Title level="1" className="text-4xl font-bold text-darker">
                            {t('charts.title')}
                        </Title>
                        <Paragraph className="text-content/80 max-w-3xl text-base md:text-lg">
                            {t('charts.subtitle')}
                        </Paragraph>
                    </div>
                    <div className="flex items-center gap-3">
                        <Selector
                            options={fundOptions.map((option) => ({
                                label: option.title,
                                value: option.id,
                            }))}
                            selectedItems={selectedFundId}
                            setSelectedItems={handleFundSelect}
                            triggerClassName="border-content-light text-content bg-background border p-3 gap-2 font-semibold shadow-sm focus:border-primary focus:ring-2 focus:ring-primary"
                            hideCheckbox
                            context={t('fund')}
                            data-testid="fund-selector"
                            data-testid-button="fund-selector-button"
                        />
                    </div>
                </header>

                <section className="text-content-lighter overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <TabNavigation tabs={tabs} activeTab={activeTab} centerTabs={false} />
                </section>

                <section>{children}</section>
            </div>
        </div>
    );
}

export default function AllChartsLayout({
    children,
    fund,
    funds = [],
    filters = {} as SearchParams,
}: AllChartsLayoutProps) {
    return (
        <FiltersProvider defaultFilters={filters}>
            <LayoutContent fund={fund} funds={funds}>
                {children}
            </LayoutContent>
        </FiltersProvider>
    );
}
