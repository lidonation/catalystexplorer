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

interface HomePageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    funds: any;
    filters: SearchParams;
    metrics: ProposalMetrics;
}

type ProposalVotesMap = Record<string, number | null>;
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

    const [proposalVotes, setProposalVotes] = useState<ProposalVotesMap>({});

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

    const extractNumericPropertyValue = useCallback((value: unknown): number | null => {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : null;
        }

        const parsed = Number.parseInt(String(value), 10);

        return Number.isNaN(parsed) ? null : parsed;
    }, []);

    const mapVotesFromProperties = useCallback(
        (propertiesResponse: ProposalPropertyResponse): ProposalVotesMap => {
            const votes: ProposalVotesMap = {};

            Object.entries(propertiesResponse).forEach(([id, properties]) => {
                const props = properties ?? {};

                if (!Object.prototype.hasOwnProperty.call(props, 'vote')) {
                    votes[id] = null;
                    return;
                }

                votes[id] = extractNumericPropertyValue(props['vote']);
            });

            return votes;
        },
        [extractNumericPropertyValue],
    );

    useEffect(() => {
        if (!auth?.user?.id) {
            setProposalVotes({});
            return;
        }

        const proposalIds = (proposals?.data || [])
            .map((proposal) => proposal.id)
            .filter((id): id is string => Boolean(id));

        if (!proposalIds.length) {
            setProposalVotes({});
            return;
        }

        let isMounted = true;

        (async () => {
            const propertiesResponse = await fetchProposalProperties(proposalIds, ['vote']);
            if (isMounted) {
                setProposalVotes(mapVotesFromProperties(propertiesResponse));
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [auth?.user?.id, fetchProposalProperties, mapVotesFromProperties, proposals?.data]);

    const proposalsWithVotes = useMemo(() => {
        if (!proposals?.data) {
            return proposals;
        }

        const mappedData = proposals.data.map((proposal) => {
            const voteValue = proposalVotes?.[String(proposal.id)];

            if (voteValue === undefined) {
                return proposal;
            }

            return {
                ...proposal,
                vote: voteValue,
            } as ProposalData;
        });

        return {
            ...proposals,
            data: mappedData,
        } as PaginatedData<ProposalData[]>;
    }, [proposals, proposalVotes]);

    const proposalsSource = proposalsWithVotes ?? proposals;

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
                                    //excludeColumnsFromSelector={['my_vote']}
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
            </FiltersProvider>
        </ListProvider>
    );
}
