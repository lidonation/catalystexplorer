import Paginator from '@/Components/Paginator';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ColumnSelector from '@/Components/ColumnSelector';
import VerticalColumnIcon from '@/Components/svgs/VerticalColumnIcon';
import { PaginatedData } from '@/types/paginated-data';
import { WhenVisible } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React, { useRef } from 'react';
import ProposalTable, { DynamicColumnConfig } from './ProposalTable';
import ProposalTableLoading from './ProposalTableLoading';
import CompareButton from './CompareButton';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import RationaleButton from '@/Components/RationaleButton';
import RemoveBookmarkButton from '@/Components/RemoveBookmarkButton';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { userSettingEnums } from '@/enums/user-setting-enums';
import ProposalData = App.DataTransferObjects.ProposalData;

interface CustomActionProps {
    proposal: ProposalData;
    'data-testid'?: string;
}

type IconAction = 'compare' | 'bookmark' | 'rationale' | 'removeBookmark';

interface ProposalTableViewProps {
    proposals: PaginatedData<ProposalData[]> | { data: ProposalData[], total: number, isPdf: boolean };
    actionType?: 'manage' | 'view';
    disableSorting?: boolean;
    columns?: string[] | DynamicColumnConfig[] | (string | DynamicColumnConfig)[];
    showPagination?: boolean;
    iconOnlyActions?: boolean;
    iconActionsConfig?: IconAction[];
    customActions?: {
        manage?: React.ComponentType<CustomActionProps>;
        view?: React.ComponentType<CustomActionProps>;
        actions?: React.ComponentType<CustomActionProps>;
    };
    renderActions?: {
        manage?: (proposal: ProposalData) => React.ReactNode;
        view?: (proposal: ProposalData) => React.ReactNode;
        actions?: (proposal: ProposalData) => React.ReactNode;
    };
    customStyles?: {
        tableWrapper?: string;
        tableHeader?: string;
        headerCell?: string;
        tableBody?: string;
        bodyCell?: string;
        table?: string;
        headerText?: string;
    };
    headerAlignment?: 'left' | 'center' | 'right';
    onColumnSelectorOpen?: () => void; // Callback to open column selector
    protectedColumns?: string[];
    excludeColumnsFromSelector?: string[];
    disableInertiaLoading?: boolean; // Disable WhenVisible loading for streaming data
}

const renderIconOnlyViewActions = (proposal: ProposalData, actionsConfig: IconAction[] = ['compare', 'bookmark']) => {
    const actionComponents = {
        compare: (
            <div key="compare" className="flex items-center justify-center w-8 h-8 rounded-md transition-colors">
                <CompareButton
                    model="proposal"
                    hash={proposal.id ?? ''}
                    tooltipDescription="Compare Proposals"
                    data={proposal}
                    data-testid="compare-button"
                    buttonTheme='text-content'
                />
            </div>
        ),
        bookmark: (
            <div key="bookmark" className="flex items-center justify-center w-8 h-8 rounded-md transition-colors">
                <BookmarkButton
                    modelType="proposals"
                    itemId={proposal.id ?? ''}
                    data-testid="bookmark-button"
                    buttonTheme='text-content'
                />
            </div>
        ),
        rationale: (
            <div key="rationale" className="flex items-center justify-center w-8 h-8 rounded-md transition-colors">
                <RationaleButton
                    proposalId={proposal.id ?? ''}
                    initialRationale={proposal.user_rationale || ''}
                    buttonTheme='text-content'
                    data-testid="rationale-button"
                />
            </div>
        ),
        removeBookmark: (
            <div key="removeBookmark" className="flex items-center justify-center w-8 h-8 rounded-md transition-colors">
                <RemoveBookmarkButton
                    proposalId={proposal.id ?? ''}
                    modelType="proposals"
                    buttonTheme='text-content'
                    data-testid="remove-bookmark-button"
                />
            </div>
        )
    };

    return (
        <div className="flex items-center gap-1">
            {actionsConfig.map(action => actionComponents[action]).filter(Boolean)}
        </div>
    );
};

const renderDefaultViewAction = (proposal: ProposalData, t: any) => {
    return (
        <div className='w-32' data-testid={`proposal-view-${proposal.id}`}>
            <a
                href={proposal.link ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors duration-200 font-medium text-sm"
                data-testid={`view-proposal-button-${proposal.id}`}
            >
                {t('proposalComparison.viewProposal')}
            </a>
        </div>
    );
};

const ProposalTableView: React.FC<ProposalTableViewProps> = ({
    proposals,
    actionType = 'view',
    disableSorting = true,
    columns = ['fund', 'title', 'yesVotes', 'abstainVotes', 'teams', 'viewProposal'],
    showPagination = true,
    iconOnlyActions = false,
    iconActionsConfig = ['compare', 'bookmark'],
    customActions,
    renderActions,
    customStyles,
    headerAlignment = 'left',
    onColumnSelectorOpen,
    protectedColumns = [],
    excludeColumnsFromSelector = ['manageProposal'],
    disableInertiaLoading = false
}) => {
    const { t } = useLaravelReactI18n();

    // Use selected columns from user settings, fall back to prop columns if not set
    const defaultColumns = ['title', 'budget', 'category', 'openSourced', 'teams', 'viewProposal'];
    const {
        value: selectedColumns,
        setValue: setSelectedColumns,
        isLoading: isColumnsLoading
    } = useUserSetting<string[]>(
        userSettingEnums.PROPOSAL_PDF_COLUMNS,
        [...new Set([...(columns as string[] || defaultColumns), ...protectedColumns])]
    );

    // Separate dynamic configs from string columns in one pass
    const dynamicConfigs: DynamicColumnConfig[] = [];
    const propStringColumns: string[] = [];
    
    if (columns && Array.isArray(columns)) {
        columns.forEach(col => {
            if (typeof col === 'object') {
                dynamicConfigs.push(col as DynamicColumnConfig);
            } else if (typeof col === 'string') {
                propStringColumns.push(col);
            }
        });
    }
    
    const dynamicConfigKeys = new Set(dynamicConfigs.map(config => config.key));
    const protectedColumnsSet = new Set(protectedColumns);
    const excludedColumnsSet = new Set(excludeColumnsFromSelector);
    
    // Determine selected columns with protected columns included
    const userSelectedColumns = selectedColumns || [...propStringColumns, ...Array.from(dynamicConfigKeys), ...defaultColumns];
    const selectedColumnKeys = new Set([...userSelectedColumns, ...protectedColumns]);
    
    const activeColumns: (string | DynamicColumnConfig)[] = [];
    
    dynamicConfigs.forEach(config => {
        if (selectedColumnKeys.has(config.key) || protectedColumnsSet.has(config.key)) {
            if (!excludedColumnsSet.has(config.key) || protectedColumnsSet.has(config.key)) {
                activeColumns.push(config);
            }
        }
    });
    
    propStringColumns.forEach(col => {
        if ((selectedColumnKeys.has(col) || protectedColumnsSet.has(col)) && !dynamicConfigKeys.has(col)) {
            if (!excludedColumnsSet.has(col) || protectedColumnsSet.has(col)) {
                activeColumns.push(col);
            }
        }
    });
    
    userSelectedColumns.forEach(col => {
        if (!propStringColumns.includes(col) && !dynamicConfigKeys.has(col) && !protectedColumnsSet.has(col)) {
            if (!excludedColumnsSet.has(col)) {
                activeColumns.push(col);
            }
        }
    });

    protectedColumns.forEach(col => {
        const existsInActive = activeColumns.some(column => {
            const columnKey = typeof column === 'string' ? column : column.key;
            return columnKey === col;
        });
        if (!existsInActive) {
            activeColumns.push(col);
        }
    });
    
    // Columns for selector (exclude protected columns from display but keep them in activeColumns)
    const columnsForSelector = Array.from(selectedColumnKeys).filter(col => 
        !excludedColumnsSet.has(col)
    );

    const getActionsConfig = () => {
        const actionRenderers = {
            manage: customActions?.manage || renderActions?.manage 
                ? (proposal: ProposalData) => {
                    if (renderActions?.manage) {
                        return renderActions.manage(proposal);
                    }
                    if (customActions?.manage) {
                        const CustomManageAction = customActions.manage;
                        return <CustomManageAction proposal={proposal} data-testid={`manage-proposal-button-${proposal.id}`} />;
                    }
                    return null;
                }
                : undefined,
            
            view: customActions?.view || renderActions?.view
                ? (proposal: ProposalData) => {
                    if (renderActions?.view && !iconOnlyActions) {
                        return renderActions.view(proposal);
                    }
                    if (customActions?.view) {
                        const CustomViewAction = customActions.view;
                        return <CustomViewAction proposal={proposal} data-testid={`view-proposal-button-${proposal.id}`} />;
                    }
                    return renderDefaultViewAction(proposal, t);
                }
                : (proposal: ProposalData) => renderDefaultViewAction(proposal, t),
                
            actions: iconOnlyActions || customActions?.actions || renderActions?.actions
                ? (proposal: ProposalData) => {
                    if (renderActions?.actions) {
                        return renderActions.actions(proposal);
                    }
                    if (customActions?.actions) {
                        const CustomActionsComponent = customActions.actions;
                        return <CustomActionsComponent proposal={proposal} data-testid={`proposal-actions-${proposal.id}`} />;
                    }
                    if (iconOnlyActions) {
                        return renderIconOnlyViewActions(proposal, iconActionsConfig);
                    }
                    return null;
                }
                : undefined
        };

        return { renderActions: actionRenderers, customActions };
    };

    const handleColumnSelectionChange = (columns: string[]) => {
        // Save all selected columns to user settings (including dynamic config keys)
        const columnsWithProtected = [...new Set([...columns, ...protectedColumns])];
        
        const filteredColumns = columnsWithProtected.filter(column => 
            !excludeColumnsFromSelector.includes(column) || protectedColumns.includes(column)
        );
        
        setSelectedColumns(filteredColumns);
    };

    const handleOpenColumnSelector = () => {
        // Scroll to the column selector and draw user's attention to it
        const columnSelectorContainer = document.querySelector('[data-testid="column-selector"]')?.parentElement;
        if (columnSelectorContainer) {
            columnSelectorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight class to draw attention
            columnSelectorContainer.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
            setTimeout(() => {
                columnSelectorContainer.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
            }, 3000);
        }
    };

    const actionsConfig = getActionsConfig();

    return (
        <>
            <div className="container mt-8">
                {!isColumnsLoading && (
                    <div className="flex justify-start mb-4">
                        <ColumnSelector
                            selectedColumns={columnsForSelector}
                            onSelectionChange={handleColumnSelectionChange}
                            icon={<VerticalColumnIcon className="w-4 h-4" />}
                            className="z-10"
                            excludeColumns={excludeColumnsFromSelector}
                            protectedColumns={protectedColumns}
                        />
                    </div>
                )}
                
                {disableInertiaLoading ? (
                    // Direct render without WhenVisible for streaming data
                    proposals?.data.length ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeIn' }}
                        >
                            <ProposalTable
                                actionType={actionType}
                                disableSorting={disableSorting}
                                proposals={proposals}
                                columns={activeColumns}
                                showPagination={showPagination}
                                customActions={actionsConfig.customActions}
                                renderActions={actionsConfig.renderActions}
                                customStyles={customStyles}
                                headerAlignment={headerAlignment}
                                onColumnSelectorOpen={onColumnSelectorOpen || handleOpenColumnSelector}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeIn' }}
                        >
                            <RecordsNotFound context="proposals" />
                        </motion.div>
                    )
                ) : (
                    // Use WhenVisible for normal Inertia loading
                    <WhenVisible
                        fallback={<ProposalTableLoading />}
                        data="proposals"
                    >
                        {proposals?.data.length ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: 'easeIn' }}
                            >
                                <ProposalTable
                                    actionType={actionType}
                                    disableSorting={disableSorting}
                                    proposals={proposals}
                                    columns={activeColumns}
                                    showPagination={showPagination}
                                    customActions={actionsConfig.customActions}
                                    renderActions={actionsConfig.renderActions}
                                    customStyles={customStyles}
                                    headerAlignment={headerAlignment}
                                    onColumnSelectorOpen={onColumnSelectorOpen || handleOpenColumnSelector}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: 'easeIn' }}
                            >
                                <RecordsNotFound context="proposals" />
                            </motion.div>
                        )}
                    </WhenVisible>
                )}
            </div>
        </>
    );
};

export default ProposalTableView;
