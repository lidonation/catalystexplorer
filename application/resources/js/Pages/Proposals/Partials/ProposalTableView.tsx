import Paginator from '@/Components/Paginator';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { WhenVisible } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';
import ProposalTable from './ProposalTable';
import ProposalTableLoading from './ProposalTableLoading';
import CompareButton from './CompareButton';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import RationaleButton from '@/Components/RationaleButton';
import RemoveBookmarkButton from '@/Components/RemoveBookmarkButton';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ProposalData = App.DataTransferObjects.ProposalData;

type ColumnKey =
    | 'title'
    | 'proposal'
    | 'fund'
    | 'status'
    | 'funding'
    | 'teams'
    | 'yesVotes'
    | 'abstainVotes'
    | 'action'
    | 'viewProposal'
    | 'budget'
    | 'category'
    | 'openSourced';

interface CustomActionProps {
    proposal: ProposalData;
    'data-testid'?: string;
}

type IconAction = 'compare' | 'bookmark' | 'rationale' | 'removeBookmark';

interface ProposalTableViewProps {
    proposals: PaginatedData<ProposalData[]> | { data: ProposalData[], total: number, isPdf: boolean };
    actionType?: 'manage' | 'view';
    disableSorting?: boolean;
    columns?: ColumnKey[];
    showPagination?: boolean;
    iconOnlyActions?: boolean;
    iconActionsConfig?: IconAction[];
    customActions?: {
        manage?: React.ComponentType<CustomActionProps>;
        view?: React.ComponentType<CustomActionProps>;
    };
    renderActions?: {
        manage?: (proposal: ProposalData) => React.ReactNode;
        view?: (proposal: ProposalData) => React.ReactNode;
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
                href={proposal.link}
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
    headerAlignment = 'left'
}) => {
    const { t } = useLaravelReactI18n();

    const getActionsConfig = () => {
        if (customActions || renderActions) {
            return { customActions, renderActions };
        }

        if (iconOnlyActions) {
            return {
                renderActions: {
                    view: (proposal: ProposalData) => renderIconOnlyViewActions(proposal, iconActionsConfig),
                    manage: undefined
                }
            };
        }

        return {
            renderActions: {
                view: (proposal: ProposalData) => renderDefaultViewAction(proposal, t),
                manage: undefined
            }
        };
    };

    const actionsConfig = getActionsConfig();

    return (
        <>
            <div className="container mt-8">
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
                                columns={columns}
                                showPagination={showPagination}
                                customActions={actionsConfig.customActions}
                                renderActions={actionsConfig.renderActions}
                                customStyles={customStyles}
                                headerAlignment={headerAlignment}
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
            </div>
        </>
    );
};

export default ProposalTableView;
