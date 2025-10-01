import ManageProposalButton from '@/Pages/My/Proposals/partials/ManageProposalButton';
import React, { useCallback, useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import TableHeaderCell from './ProposalTableHeaderCell';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { router } from '@inertiajs/react';
import Paginator from '@/Components/Paginator';
import { PaginatedData } from '@/types/paginated-data';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProposalData = App.DataTransferObjects.ProposalData;
import Paragraph from '@/Components/atoms/Paragraph';
import Button from '@/Components/atoms/Button';
import VerticalColumnIcon from '@/Components/svgs/VerticalColumnIcon';
import {
    proposalColumnRenderers,
    defaultColumnHeaders,
    getDynamicColumnHeaders,
    getNestedValue,
    generateColumnHeader,
    builtInRenderers,
    type TableHelpers,
    type ColumnRendererConfig
} from '@/lib/proposalColumnRenderers';
import { getColumnRendererType, getCustomColumnLabel } from '@/lib/columnUtils';

interface ColumnConfig {
    key: string;
    label: string | React.ReactNode;
    sortable?: boolean;
    sortKey?: string;
    renderCell: (
        proposal: ProposalData,
        helpers: TableHelpers
    ) => React.ReactNode;
}

type ActionType = 'manage' | 'view';

interface CustomActionProps {
    proposal: ProposalData;
    'data-testid'?: string;
}

interface TableStyleProps {
    tableWrapper?: string;
    tableHeader?: string;
    headerCell?: string;
    tableBody?: string;
    bodyCell?: string;
    table?: string;
    headerText?: string;
}

// Dynamic column configuration interface
interface DynamicColumnConfig {
    key: string;
    type?: 'text' | 'link' | 'currency' | 'component';
    label?: string | React.ReactNode; 
    sortable?: boolean;
    sortKey?: string; 
    component?: React.ComponentType<{ proposal: ProposalData; helpers?: TableHelpers }>; 
}

interface ProposalTableProps {
    proposals: PaginatedData<ProposalData[]> | { data: ProposalData[], total: number, isPdf: boolean };
    columns?: string[] | DynamicColumnConfig[] | (string | DynamicColumnConfig)[]; 
    actionType?: ActionType;
    disableSorting?: boolean;
    showPagination?: boolean;
    columnVisibility?: Record<string, boolean>;
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
    customStyles?: TableStyleProps;
    headerAlignment?: 'left' | 'center' | 'right';
    onColumnSelectorOpen?: () => void; // Callback to open column selector
}

const generateCustomRendererConfig = (
    columnPath: string,
    customRenderer: ColumnRendererConfig,
    disableSorting: boolean,
    getColumnHeader: (key: string) => string | React.ReactNode,
    getCustomColumnLabel: (key: string) => string | null
): ColumnConfig => {
    const customLabel = getCustomColumnLabel(columnPath);
    const label = customLabel || getColumnHeader(columnPath);

    // Handle function-based renderer (React component)
    if (typeof customRenderer === 'function') {
        return {
            key: columnPath,
            label,
            sortable: !disableSorting,
            sortKey: columnPath,
            renderCell: (proposal: ProposalData, helpers: TableHelpers) => {
                const ComponentRenderer = customRenderer as React.ComponentType<{ proposal: ProposalData; helpers?: TableHelpers }>;
                return <ComponentRenderer proposal={proposal} helpers={helpers} />;
            }
        };
    }

    // Handle configuration-based renderer
    if (typeof customRenderer === 'object' && customRenderer !== null) {
        if ('type' in customRenderer && customRenderer.type) {
            const config = customRenderer as { 
                type: string; 
                component?: React.ComponentType<{ proposal: ProposalData; helpers?: TableHelpers }>; 
                sortKey?: string; 
                sortable?: boolean; 
            };
            
            return {
                key: columnPath,
                label,
                sortable: config.sortable !== false && !disableSorting,
                sortKey: config.sortKey || columnPath,
                renderCell: (proposal: ProposalData, helpers: TableHelpers) => {
                    // Handle custom component
                    if (config.type === 'component' && config.component) {
                        const ComponentRenderer = config.component;
                        return <ComponentRenderer proposal={proposal} helpers={helpers} />;
                    }
                    
                    // Handle built-in type renderers
                    if (config.type && builtInRenderers[config.type as keyof typeof builtInRenderers]) {
                        const renderer = builtInRenderers[config.type as keyof typeof builtInRenderers];
                        return renderer({ proposal, path: columnPath });
                    }
                    
                    // Fallback to consistent text rendering
                    return renderFallbackText(proposal, columnPath);
                }
            };
        }
        
        return {
            key: columnPath,
            label,
            sortable: !disableSorting,
            sortKey: columnPath,
            renderCell: (proposal: ProposalData) => renderFallbackText(proposal, columnPath)
        };
    }

    return {
        key: columnPath,
        label,
        sortable: !disableSorting,
        sortKey: columnPath,
        renderCell: (proposal: ProposalData) => renderFallbackText(proposal, columnPath)
    };
};


 //Consistent fallback text rendering
 
const renderFallbackText = (proposal: ProposalData, columnPath: string): React.ReactNode => {
    const value = getNestedValue(proposal, columnPath);
    return (
        <Paragraph 
            className="text-md text-content" 
            data-testid={`proposal-${columnPath.replace(/\./g, '-')}-${proposal.id}`}
        >
            {value?.toString() || '–'}
        </Paragraph>
    );
};

const ProposalTable: React.FC<ProposalTableProps> = ({
                                                         proposals,
                                                         columns,
                                                         actionType = 'manage',
                                                         disableSorting = false,
                                                         showPagination = true,
                                                         customActions,
                                                         renderActions,
                                                         customStyles,
                                                         headerAlignment = 'left',
                                                         onColumnSelectorOpen
                                                     }) => {
    const { t } = useLaravelReactI18n();
    const { setFilters, getFilter } = useFilterContext();
    const [selectedUserMap, setSelectedUserMap] = useState<
        Record<string, IdeascaleProfileData | null>
    >({});

    const defaultColumns: string[] = [
        'proposal',
        'status',
        'funding',
        'teams',
        'manageProposal',
        'viewProposal',
        'proposalActions'
    ].filter(Boolean) as string[];

    const activeColumns = columns || defaultColumns;

    const currentSort = getFilter(ParamsEnum.SORTS) || null;
    const [sortField, sortDirection] = currentSort ? currentSort.split(':') : [null, null];

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';

        if (sortField === key) {
            if (sortDirection === 'asc') {
                direction = 'desc';
            } else if (sortDirection === 'desc') {
                direction = null;
            } else {
                direction = 'asc';
            }
        }

        if (!direction) {
            const url = new URL(window.location.href);
            url.searchParams.delete(ParamsEnum.SORTS);

            router.get(url.pathname + url.search, {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });

            setFilters({
                param: ParamsEnum.SORTS,
                value: null,
                label: 'Sort'
            });
        } else {
            setFilters({
                param: ParamsEnum.SORTS,
                value: `${key}:${direction}`,
                label: 'Sort'
            });
        }
    };

    const getColumnHeader = (columnKey: string): string | React.ReactNode => {
        const dynamicHeaders = getDynamicColumnHeaders(t);
        const customLabel = getCustomColumnLabel(columnKey);
        return customLabel || dynamicHeaders[columnKey] || defaultColumnHeaders[columnKey] || generateColumnHeader(columnKey);
    };

    const generateColumnConfig = (columnInput: string | DynamicColumnConfig): ColumnConfig => {
        // Dynamic configs (objects) take precedence and can override existing column renderers
        if (typeof columnInput === 'object') {
            const dynamicConfig = columnInput;
            
            return {
                key: dynamicConfig.key,
                label: dynamicConfig.label || getColumnHeader(dynamicConfig.key),
                sortable: dynamicConfig.sortable !== false && !disableSorting,
                sortKey: dynamicConfig.sortKey || dynamicConfig.key,
                renderCell: (proposal: ProposalData, helpers: TableHelpers) => {
                    if (dynamicConfig.component) {
                        const ComponentRenderer = dynamicConfig.component;
                        return <ComponentRenderer proposal={proposal} helpers={helpers} />;
                    }
                    
                    const type = dynamicConfig.type || 'text';
                    
                    // Handle built-in types
                    if (builtInRenderers[type as keyof typeof builtInRenderers]) {
                        const renderer = builtInRenderers[type as keyof typeof builtInRenderers];
                        return renderer({ proposal, path: dynamicConfig.key });
                    }
                 
                    return renderFallbackText(proposal, dynamicConfig.key);
                }
            };
        }

        // Legacy string-based column configuration
        const columnPath = columnInput;
        
        // Handle special action columns
        if (columnPath === 'action') {
            return {
                key: 'action',
                label: t('proposals.action'),
                renderCell: (proposal: ProposalData) => {
                    const testId = `proposal-action-${proposal.id}`;

                    if (renderActions?.manage) {
                        return (
                            <div data-testid={testId}>
                                {renderActions.manage(proposal)}
                            </div>
                        );
                    }

                    if (customActions?.manage) {
                        const CustomManageAction = customActions.manage;
                        return (
                            <div data-testid={testId}>
                                <CustomManageAction
                                    proposal={proposal}
                                    data-testid={`manage-proposal-button-${proposal.id}`}
                                />
                            </div>
                        );
                    }

                    return (
                        <div data-testid={testId}>
                            <ManageProposalButton
                                proposal={proposal}
                                data-testid={`manage-proposal-button-${proposal.id}`}
                            />
                        </div>
                    );
                }
            };
        }

        if (columnPath === 'manageProposal') {
            return {
                key: 'manageProposal',
                label: t('proposals.manageProposal'),
                renderCell: (proposal: ProposalData) => {
                    const testId = `proposal-manage-${proposal.id}`;

                    if (renderActions?.manage) {
                        return (
                            <div data-testid={testId}>
                                {renderActions.manage(proposal)}
                            </div>
                        );
                    }

                    if (customActions?.manage) {
                        const CustomManageAction = customActions.manage;
                        return (
                            <div data-testid={testId}>
                                <CustomManageAction
                                    proposal={proposal}
                                    data-testid={`manage-proposal-button-${proposal.id}`}
                                />
                            </div>
                        );
                    }

                    return (
                        <div data-testid={testId}>
                            <ManageProposalButton
                                proposal={proposal}
                                data-testid={`manage-proposal-button-${proposal.id}`}
                            />
                        </div>
                    );
                }
            };
        }

        if (columnPath === 'viewProposal') {
            return {
                key: 'viewProposal',
                label: t('proposalComparison.viewProposal'),
                renderCell: (proposal: ProposalData) => {
                    const testId = `proposal-view-${proposal.id}`;

                    if (renderActions?.view) {
                        return (
                            <div data-testid={testId}>
                                {renderActions.view(proposal)}
                            </div>
                        );
                    }

                    if (customActions?.view) {
                        const CustomViewAction = customActions.view;
                        return (
                            <div data-testid={testId}>
                                <CustomViewAction
                                    proposal={proposal}
                                    data-testid={`view-proposal-actions-${proposal.id}`}
                                />
                            </div>
                        );
                    }

                    return (
                        <div className="w-32" data-testid={testId}>
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
                }
            };
        }

        if (columnPath === 'proposalActions') {
            return {
                key: 'proposalActions',
                label: t('proposals.actions'),
                renderCell: (proposal: ProposalData) => {
                    const testId = `proposal-actions-${proposal.id}`;

                    if (renderActions?.actions) {
                        return (
                            <div data-testid={testId}>
                                {renderActions.actions(proposal)}
                            </div>
                        );
                    }

                    if (customActions?.actions) {
                        const CustomActionsComponent = customActions.actions;
                        return (
                            <div data-testid={testId}>
                                <CustomActionsComponent
                                    proposal={proposal}
                                    data-testid={`proposal-actions-${proposal.id}`}
                                />
                            </div>
                        );
                    }

                    return (
                        <div data-testid={testId}>
                          
                        </div>
                    );
                }
            };
        }

        // Check if we have a custom renderer for this column
        const customRenderer = proposalColumnRenderers[columnPath];
        
        if (customRenderer) {
            return generateCustomRendererConfig(columnPath, customRenderer, disableSorting, getColumnHeader, getCustomColumnLabel);
        }

        // Fallback: use appropriate renderer based on column type
        const rendererType = getColumnRendererType(columnPath);
        const customLabel = getCustomColumnLabel(columnPath);
        
        return {
            key: columnPath,
            label: customLabel || generateColumnHeader(columnPath),
            sortable: !disableSorting,
            sortKey: columnPath,
            renderCell: (proposal: ProposalData) => {
                // Use the built-in renderer for the determined type
                if (builtInRenderers[rendererType as keyof typeof builtInRenderers]) {
                    const renderer = builtInRenderers[rendererType as keyof typeof builtInRenderers];
                    return renderer({ proposal, path: columnPath });
                }
                
                return renderFallbackText(proposal, columnPath);
            }
        };
    };

    const orderedColumns: ColumnConfig[] = (activeColumns as (string | DynamicColumnConfig)[])
        .map(columnInput => generateColumnConfig(columnInput))
        .filter(Boolean);

    // Check if we have no columns to display
    const hasNoColumns = !orderedColumns || orderedColumns.length === 0;

    const getRowHelpers = useCallback(
        (proposalHash: string): TableHelpers => {
            return {
                selectedUser: selectedUserMap[proposalHash] ?? null,
                handleUserClick: (user: IdeascaleProfileData) => {
                    setSelectedUserMap((prev) => ({
                        ...prev,
                        [proposalHash]: user
                    }));
                },
                noSelectedUser: () => {
                    setSelectedUserMap((prev) => ({
                        ...prev,
                        [proposalHash]: null
                    }));
                }
            };
        },
        [selectedUserMap]
    );

    const defaultStyles: TableStyleProps = {
        tableWrapper: 'mb-8 rounded-lg border-2 border-gray-200 bg-background shadow-md',
        tableHeader: 'border-gray-200 whitespace-nowrap bg-background-lighter',
        headerCell: 'border-gray-200 border-b border-r px-4 py-3 text-left font-medium text-content last:border-r-0',
        tableBody: '',
        bodyCell: 'border-gray-200 border-b border-r px-4 py-4 text-content last:border-r-0',
        table: 'w-max min-w-full',
        headerText: 'text-content/60'
    };

    // Merge custom styles with defaults - custom styles will override defaults
    const styles = {
        tableWrapper: `${defaultStyles.tableWrapper} ${customStyles?.tableWrapper || ''}`.trim(),
        tableHeader: `${defaultStyles.tableHeader} ${customStyles?.tableHeader || ''}`.trim(),
        headerCell: `${defaultStyles.headerCell} ${customStyles?.headerCell || ''}`.trim(),
        tableBody: `${defaultStyles.tableBody} ${customStyles?.tableBody || ''}`.trim(),
        bodyCell: `${defaultStyles.bodyCell} ${customStyles?.bodyCell || ''}`.trim(),
        table: `${defaultStyles.table} ${customStyles?.table || ''}`.trim(),
        headerText: customStyles?.headerText || defaultStyles.headerText
    };

    return (
        <div className={styles.tableWrapper}>
            {hasNoColumns && onColumnSelectorOpen ? (
                // Empty state when no columns are selected
                <div className="flex flex-col items-center justify-center py-16 px-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-light-gray-persist rounded-full mb-4">
                        <VerticalColumnIcon className="w-8 h-8 text-dark" />
                    </div>
                    <Paragraph className="text-lg text-gray-persist/[0.5] mb-2 text-center font-medium">
                        {t('proposalTable.noColumnsSelected')}
                    </Paragraph>
                    <Paragraph className="text-sm text-gray-persist mb-6 text-center max-w-md">
                        {t('proposalTable.selectColumnsToView')}
                    </Paragraph>
                    <Button
                        onClick={onColumnSelectorOpen}
                        className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        dataTestId="open-column-selector-button"
                    >
                        <VerticalColumnIcon className="w-4 h-4" />
                        {t('proposalTable.selectColumns')}
                    </Button>
                </div>
            ) : (
                // Regular table rendering
                <div className="overflow-x-auto">
                    <table className={styles.table}>
                        <thead className={styles.tableHeader}
                               data-testid="proposal-table-header">
                        <tr data-testid="proposal-table-header-row">
                            {orderedColumns.map(column => (
                                <th
                                    key={column.key}
                                    className={styles.headerCell}
                                    data-testid={`proposal-table-header-${column.key}`}
                                >
                                    <TableHeaderCell
                                        label={column.label}
                                        sortable={column.sortable}
                                        sortDirection={column.sortKey === sortField ? sortDirection as 'asc' | 'desc' | null : null}
                                        onSort={column.sortable ? () => handleSort(column.sortKey || column.key) : undefined}
                                        alignment={headerAlignment}
                                        textColorClass={styles.headerText}
                                        data-testid={`proposal-table-header-cell-${column.key}`}
                                    />
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody data-testid="proposal-table-body">
                        {proposals.data && proposals.data.map((proposal, index) => {
                            const proposalHash = proposal.id ?? '';
                            const helpers = getRowHelpers(proposalHash);

                            return (
                                <tr
                                    key={proposalHash}
                                    className={index < proposals.data.length - 1 ? 'border-b border-gray-200' : ''}
                                    data-testid={`proposal-table-row-${proposalHash}`}
                                >
                                    {orderedColumns.map(column => (
                                        <td
                                            key={`${proposalHash}-${column.key}`}
                                            className={styles.bodyCell}
                                            data-testid={`proposal-table-cell-${proposalHash}-${column.key}`}
                                        >
                                            {column.renderCell(proposal, helpers)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Only show pagination if we have columns and data */}
            {!hasNoColumns && showPagination && proposals && proposals.data && proposals.data.length > 0 && 'current_page' in proposals && (
                <div className="border-t border-gray-200 px-4 py-4">
                    <Paginator
                        pagination={proposals}
                        linkProps={{
                            //preserveState: true,
                            //preserveScroll: false
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ProposalTable;
export { type DynamicColumnConfig };
