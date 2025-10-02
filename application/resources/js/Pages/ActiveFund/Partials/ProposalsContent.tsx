import Paginator from '@/Components/Paginator';
import SearchControls from '@/Components/atoms/SearchControls';
import { FiltersProvider } from '@/Context/FiltersContext';
import ProposalResultsLoading from '@/Pages/Proposals/Partials/ProposalResultsLoading';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import ProposalTableView from '@/Pages/Proposals/Partials/ProposalTableView';
import ProposalTableLoading from '@/Pages/Proposals/Partials/ProposalTableLoading';
import CardLayoutSwitcher from '@/Pages/Proposals/Partials/CardLayoutSwitcher';
import ProposalFilters from '@/Pages/Proposals/Partials/ProposalFilters';
import { WhenVisible } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState } from 'react';
import { SearchParams } from '@/types/search-params';
import { PaginatedData } from '@/types/paginated-data';
import { useUserSetting } from '@/useHooks/useUserSettings';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { ParamsEnum } from '@/enums/proposal-search-params';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import ProposalData = App.DataTransferObjects.ProposalData;
import Paragraph from '@/Components/atoms/Paragraph';

interface ProposalsContentProps {
    proposals: ProposalData[];
    pagination?: PaginatedData<ProposalData[]>;
    filters?: SearchParams;
    showTitle?: boolean;
    className?: string;
}

const ProposalsContent: React.FC<ProposalsContentProps> = ({
    proposals,
    pagination,
    filters = {} as SearchParams,
    className = "space-y-6",
}) => {
    const { t } = useLaravelReactI18n();
    const { value: isHorizontal, isLoading: isHorizontalLoading } = useUserSetting<boolean>(userSettingEnums.VIEW_HORIZONTAL, false);
    const { value: isMini, isLoading: isMiniLoading } = useUserSetting<boolean>(userSettingEnums.VIEW_MINI, false);
    const { value: isTableView, isLoading: isTableViewLoading } = useUserSetting<boolean>(userSettingEnums.VIEW_TABLE, false);
    
    const [showFilters, setShowFilters] = useState(false);
    const [quickPitchView, setQuickPitchView] = useState(
        !!parseInt(filters[ParamsEnum.QUICK_PITCHES] || '0'),
    );
    
    const isViewSettingsLoading = isHorizontalLoading || isMiniLoading || isTableViewLoading;
    const settingsInitialized = !isViewSettingsLoading;
    const currentIsHorizontal = isHorizontal ?? false;
    const currentIsMini = isMini ?? false;
    const currentIsTableView = quickPitchView ? false : (isTableView ?? false);
    
    const paginationData = pagination ? {
        ...pagination,
        data: proposals
    } : undefined;

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{
                only: ['proposals', 'pagination', 'campaign', 'fund'],
                preserveScroll: true,
            }}
        >
            <div className={className}>                
                <div className="container">
                    <SearchControls
                        onFiltersToggle={setShowFilters}
                        sortOptions={ProposalSortingOptions()}
                        searchPlaceholder={t('searchBar.placeholder')}
                    />
                </div>
                
                <section
                    className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                        showFilters ? 'max-h-[500px]' : 'max-h-0'
                    }`}
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
                                    proposals={paginationData || { data: proposals, total: proposals.length, isPdf: false }}
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
                                    containerClassName="-mt-8"
                                />
                            ) : (
                                <>
                                    <WhenVisible
                                        data="proposals"
                                        fallback={<ProposalResultsLoading />}
                                    >
                                        <section className="container mt-3 w-full pb-8">
                                            {proposals && proposals.length > 0 ? (
                                                <div className="py-4">
                                                    <ProposalResults
                                                        proposals={proposals}
                                                        isHorizontal={currentIsHorizontal}
                                                        quickPitchView={quickPitchView}
                                                        setGlobalQuickPitchView={setQuickPitchView}
                                                        isMini={currentIsMini}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <Paragraph className="text-gray-persist text-lg">
                                                        {t('campaigns.noProposalsFound')}
                                                    </Paragraph>
                                                </div>
                                            )}
                                        </section>
                                        
                                        {paginationData && paginationData.last_page > 1 && (
                                            <section className="container">
                                                <Paginator
                                                    pagination={paginationData}
                                                    linkProps={{
                                                        only: ['proposals', 'pagination', 'campaign', 'fund'],
                                                        preserveScroll: true,
                                                    }}
                                                />
                                            </section>
                                        )}
                                    </WhenVisible>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="container">
                        {currentIsTableView ? <ProposalTableLoading /> : <ProposalResultsLoading />}
                    </div>
                )}
            </div>
        </FiltersProvider>
    );
};

export default ProposalsContent;
