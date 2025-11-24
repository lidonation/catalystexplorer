import axios from 'axios';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLaravelReactI18n } from "laravel-react-i18n";
import { motion, AnimatePresence } from 'framer-motion';
import CardLayoutSwitcher from './Partials/CardLayoutSwitcher';
import FundFiltersContainer from './Partials/FundFiltersContainer';
import ProposalFilters from './Partials/ProposalFilters';
import ProposalPaginatedList from './Partials/ProposalPaginatedList';
import ProposalTableView from './Partials/ProposalTableView';
import { useUserSetting } from '@/useHooks/useUserSettings';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import ProposalData = App.DataTransferObjects.ProposalData;
import GraphButton from '@/Components/GraphButton';
import MetricsBar from '@/Pages/Proposals/Partials/MetricsBar';

interface HomePageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    funds: any;
    filters: SearchParams;
    metrics: ProposalMetrics;
}

type ProposalPropertyResponse = Record<string, Record<string, unknown>>;

export default function Index({
    proposals,
    funds,
    filters,
    metrics,
    auth,
}: PageProps<HomePageProps>) {
    const { t } = useLaravelReactI18n();
    const { setMetrics } = useMetrics();
    const [showMetricsBar, setShowMetricsBar] = useState(true);
    const toggleMetricsBar = () => {
        setShowMetricsBar(!showMetricsBar);
    };

    const [proposalProperties, setProposalProperties] = useState<ProposalPropertyResponse>({});

    // Read-only state for display purposes - CardLayoutSwitcher manages the actual settings
    const { value: isHorizontal, isLoading: isHorizontalLoading } = useUserSetting<boolean>(userSettingEnums.VIEW_HORIZONTAL, false);
    const { value: isMini, isLoading: isMiniLoading } = useUserSetting<boolean>(userSettingEnums.VIEW_MINI, false);
    const { value: isTableView, isLoading: isTableViewLoading } = useUserSetting<boolean>(userSettingEnums.VIEW_TABLE, false);

    const [showFilters, setShowFilters] = useState(false);

    const [quickPitchView, setQuickPitchView] = useState(
        !!parseInt(filters[ParamsEnum.QUICK_PITCHES]),
    );

    const fetchProposalProperties = useCallback(
        async (
            proposalIds: string[],
            properties: string[] = ['vote'],
        ): Promise<ProposalPropertyResponse> => {
            if (!proposalIds.length) {
                return {};
            }

            const normalizedProperties = properties
                .map((prop) => prop?.trim())
                .filter((prop): prop is string => Boolean(prop));

            if (!normalizedProperties.length) {
                return {};
            }

            try {
                const proposalsMapUrl = generateLocalizedRoute(
                    'proposals.map',
                );

                const response = await axios.get<ProposalPropertyResponse>(
                    proposalsMapUrl,
                    {
                        params: {
                            proposal_ids: proposalIds,
                            properties: normalizedProperties,
                        },
                    },
                );

                return response.data ?? {};
            } catch (error) {
                console.error('Failed to fetch proposal properties', error);
                return {};
            }
        },
        [],
    );

    const requestedPropertyKeys = useMemo(() => ['vote'], []);

    useEffect(() => {
        if (!auth?.user?.id) {
            setProposalProperties({});
            return;
        }

        const proposalIds = (proposals?.data || [])
            .map((proposal) => proposal.id)
            .filter((id): id is string => Boolean(id));

        if (!proposalIds.length) {
            setProposalProperties({});
            return;
        }

        let isMounted = true;

        (async () => {
            const propertiesResponse = await fetchProposalProperties(proposalIds, requestedPropertyKeys);
            if (isMounted) {
                setProposalProperties(propertiesResponse);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [auth?.user?.id, fetchProposalProperties, proposals?.data, requestedPropertyKeys]);

    const proposalsWithProperties = useMemo(() => {
        if (!proposals?.data) {
            return proposals;
        }

        const mappedData = proposals.data.map((proposal) => {
            const proposalId = String(proposal.id);
            const properties = proposalProperties?.[proposalId];

            if (!properties || Object.keys(properties).length === 0) {
                return proposal;
            }

            return {
                ...proposal,
                ...properties,
            } as ProposalData;
        });

        return {
            ...proposals,
            data: mappedData,
        } as PaginatedData<ProposalData[]>;
    }, [proposals, proposalProperties]);

    const proposalsSource = proposalsWithProperties ?? proposals;

    // Derived state for display
    const isViewSettingsLoading = isHorizontalLoading || isMiniLoading || isTableViewLoading;
    const settingsInitialized = !isViewSettingsLoading;
    const currentIsHorizontal = isHorizontal ?? false;
    const currentIsMini = isMini ?? false;
    const currentIsTableView = quickPitchView ? false : (isTableView ?? false);

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

                <div className="relative container pb-20">
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
                                        proposals={proposalsSource}
                                        actionType="view"
                                        disableSorting={true}
                                        columns={[
                                            'title',
                                            'viewProposal',
                                            'fund',
                                            'status',
                                            'funding',
                                            'teams',
                                            'yesVotes',
                                            'abstainVotes'
                                        ]}
                                        iconOnlyActions={true}
                                    />
                                ) : (
                                    <ProposalPaginatedList
                                        proposals={proposalsSource}
                                        isHorizontal={currentIsHorizontal}
                                        isMini={currentIsMini}
                                        quickPitchView={quickPitchView}
                                        setQuickPitchView={setQuickPitchView}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    ) : null}

                    <div className="fixed bottom-4 justify-center items-center z-40">
                        <GraphButton 
                        />
                    </div>
                </div> 
            </FiltersProvider>
        </ListProvider>
    );
}
