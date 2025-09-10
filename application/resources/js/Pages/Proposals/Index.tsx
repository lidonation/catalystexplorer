import Paragraph from '@/Components/atoms/Paragraph';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import { useMetrics } from '@/Context/MetricsContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import { PageProps } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import { ProposalMetrics } from '@/types/proposal-metrics';
import { SearchParams } from '@/types/search-params';
import { Head, WhenVisible } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import { useLaravelReactI18n } from "laravel-react-i18n";
import { motion, AnimatePresence } from 'framer-motion';
import CardLayoutSwitcher from './Partials/CardLayoutSwitcher';
import FundFiltersContainer from './Partials/FundFiltersContainer';
import ProposalFilters from './Partials/ProposalFilters';
import ProposalPaginatedList from './Partials/ProposalPaginatedList';
import ProposalTableView from './Partials/ProposalTableView';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { userSettingEnums } from '@/enums/user-setting-enums';
import ProposalData = App.DataTransferObjects.ProposalData;

interface HomePageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    funds: any;
    filters: SearchParams;
    metrics: ProposalMetrics;
}

export default function Index({
    proposals,
    funds,
    filters,
    metrics,
}: PageProps<HomePageProps>) {
    const { t } = useLaravelReactI18n();
    const { setMetrics } = useMetrics();

    // Read-only state for display purposes - CardLayoutSwitcher manages the actual settings
    const { value: isHorizontal, isLoading: isHorizontalLoading } = useUserSetting<boolean>(userSettingEnums.VIEW_HORIZONTAL, false);
    const { value: isMini, isLoading: isMiniLoading } = useUserSetting<boolean>(userSettingEnums.VIEW_MINI, false);
    const { value: isTableView, isLoading: isTableViewLoading } = useUserSetting<boolean>(userSettingEnums.VIEW_TABLE, false);

    const [showFilters, setShowFilters] = useState(false);

    const [quickPitchView, setQuickPitchView] = useState(
        !!parseInt(filters[ParamsEnum.QUICK_PITCHES]),
    );

    // Derived state for display
    const isViewSettingsLoading = isHorizontalLoading || isMiniLoading || isTableViewLoading;
    const settingsInitialized = !isViewSettingsLoading;
    const currentIsHorizontal = isHorizontal ?? false;
    const currentIsMini = isMini ?? false;
    const currentIsTableView = isTableView ?? false;

    useEffect(() => {
        if (metrics) {
            setMetrics(metrics);
        }

        return () => {
            setMetrics(undefined);
        };
    }, [metrics, setMetrics]);

    return (
        <ListProvider>
            <FiltersProvider
                defaultFilters={filters}
                routerOptions={{ only: ['proposals', 'metrics', 'funds'] }}
            >
                <Head title={t('proposals.proposals')} />

                <header>
                    <div className="container">
                        <Title level="1" data-testid="proposal-page-title">
                            {t('proposals.proposals')}
                        </Title>
                    </div>

                    <div className="container">
                        <Paragraph
                            className="text-content"
                            data-testid="proposal-page-subtitle"
                        >
                            {t('proposals.pageSubtitle')}
                        </Paragraph>
                    </div>
                </header>

                <section className="container">
                    <FundFiltersContainer funds={funds} />
                </section>

                <section className="container">
                    <SearchControls
                        onFiltersToggle={setShowFilters}
                        sortOptions={ProposalSortingOptions()}
                        searchPlaceholder={t('searchBar.placeholder')}
                    />
                </section>

                <section
                    className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                        showFilters ? 'max-h-[500px]' : 'max-h-0'
                    }`}
                    data-testid="proposal-filters-container"
                >
                    <ProposalFilters />
                </section>

                <section className="container flex flex-col items-end pt-2 pb-1">
                    <CardLayoutSwitcher
                        quickPitchView={quickPitchView}
                        setGlobalQuickPitchView={setQuickPitchView}
                    />
                </section>

                {settingsInitialized ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIsTableView ? 'table' : 'list'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                        >
                            {currentIsTableView ? (
                                <ProposalTableView
                                    proposals={proposals}
                                    actionType="view"
                                    disableSorting={true}
                                    columns={['title', 'viewProposal', 'fund', 'status', 'funding', 'teams', 'yesVotes', 'abstainVotes']}
                                    iconOnlyActions={true}
                                />
                            ) : (
                                <ProposalPaginatedList
                                    proposals={proposals}
                                    isHorizontal={currentIsHorizontal}
                                    isMini={currentIsMini}
                                    quickPitchView={quickPitchView}
                                    setQuickPitchView={setQuickPitchView}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                ) : null}
            </FiltersProvider>
        </ListProvider>
    );
}