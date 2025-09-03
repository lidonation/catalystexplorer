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
    | 'viewProposal';

interface CustomActionProps {
    proposal: ProposalData;
    'data-testid'?: string;
}

interface ProposalTableViewProps {
    proposals: PaginatedData<ProposalData[]>;
    actionType?: 'manage' | 'view';
    disableSorting?: boolean;
    columns?: ColumnKey[];
    showPagination?: boolean;
    iconOnlyActions?: boolean;
    customActions?: {
        manage?: React.ComponentType<CustomActionProps>;
        view?: React.ComponentType<CustomActionProps>;
    };
    renderActions?: {
        manage?: (proposal: ProposalData) => React.ReactNode;
        view?: (proposal: ProposalData) => React.ReactNode;
    };
}

const renderIconOnlyViewActions = (proposal: ProposalData) => {
    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-md transition-colors">
                <CompareButton
                    model="proposal"
                    hash={proposal.id ?? ''}
                    tooltipDescription="Compare Proposals"
                    data={proposal}
                    data-testid="compare-button"
                />
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-md transition-colors">
                <BookmarkButton
                    modelType="proposals"
                    itemId={proposal.id ?? ''}
                    data-testid="bookmark-button"
                />
            </div>
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
    customActions,
    renderActions
}) => {
    const { t } = useLaravelReactI18n();

    const getActionsConfig = () => {
        if (customActions || renderActions) {
            return { customActions, renderActions };
        }
        
        if (iconOnlyActions) {
            return {
                renderActions: {
                    view: renderIconOnlyViewActions,
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