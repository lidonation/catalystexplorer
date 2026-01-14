import React from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { PaginatedData } from '@/types/paginated-data';
import Paginator from '@/Components/Paginator';
import Paragraph from '@/Components/atoms/Paragraph';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/atoms/Tooltip';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import ProposalData = App.DataTransferObjects.ProposalData;
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

interface ListProposalsTableProps {
    proposals: PaginatedData<ProposalData[]>;
    bookmarkCollection: BookmarkCollectionData;
}

const ListProposalsTable: React.FC<ListProposalsTableProps> = ({
    proposals,
    bookmarkCollection,
}) => {
    const { t } = useLaravelReactI18n();

    const removeBookmarkRoute = useLocalizedRoute('workflows.bookmarks.removeBookmarkItem', {
        bookmarkCollection: bookmarkCollection.id,
    });

    const formatCurrency = (amount: number | null, currency: string): string => {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
    };

    const handleRemove = (proposal: ProposalData) => {
        router.post(
            removeBookmarkRoute,
            {
                modelType: 'proposals',
                hash: proposal.id,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    return (
        <div className="mb-8 rounded-lg border-2 border-gray-200 bg-background shadow-md">
            <div className="overflow-x-auto">
                <table className="w-max min-w-full">
                    <thead className="border-gray-200 whitespace-nowrap bg-background-lighter">
                        <tr>
                            <th className="border-gray-200 border-b border-r px-4 py-3 text-left font-medium text-content last:border-r-0">
                                <span className="text-content/60">{t('proposals.proposals')}</span>
                            </th>
                            <th className="border-gray-200 border-b border-r px-4 py-3 text-left font-medium text-content last:border-r-0">
                                <span className="text-content/60">{t('funds.fund')}</span>
                            </th>
                            <th className="border-gray-200 border-b border-r px-4 py-3 text-left font-medium text-content last:border-r-0">
                                <span className="text-content/60">{t('Category')}</span>
                            </th>
                            <th className="border-gray-200 border-b border-r px-4 py-3 text-right font-medium text-content last:border-r-0">
                                <span className="text-content/60">{t('Budget')}</span>
                            </th>
                            <th className="border-gray-200 border-b border-r px-4 py-3 text-center font-medium text-content last:border-r-0">
                                <span className="text-content/60">{t('Actions')}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {proposals.data.map((proposal, index) => (
                            <tr
                                key={proposal.id}
                                className={index < proposals.data.length - 1 ? 'border-b border-gray-200' : ''}
                            >
                                <td className="border-gray-200 border-b border-r px-4 py-4 text-content last:border-r-0">
                                    <div className="flex flex-col gap-1">
                                        <Paragraph className="text-md text-content font-medium">
                                            {proposal.title}
                                        </Paragraph>
                                    </div>
                                </td>
                                <td className="border-gray-200 border-b border-r px-4 py-4 text-content last:border-r-0">
                                    <Paragraph className="text-md text-content">
                                        {proposal.fund?.label || '–'}
                                    </Paragraph>
                                </td>
                                <td className="border-gray-200 border-b border-r px-4 py-4 text-content last:border-r-0">
                                    <Paragraph className="text-md text-content">
                                        {proposal.campaign?.title || '–'}
                                    </Paragraph>
                                </td>
                                <td className="border-gray-200 border-b border-r px-4 py-4 text-content last:border-r-0 text-right">
                                    <Paragraph className="text-md text-content">
                                        {formatCurrency(
                                            proposal.amount_requested ?? null,
                                            proposal.currency || 'ADA'
                                        )}
                                    </Paragraph>
                                </td>
                                <td className="border-gray-200 border-b border-r px-4 py-4 text-content last:border-r-0 text-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => handleRemove(proposal)}
                                                    className="inline-flex items-center justify-center rounded-full p-2 text-content hover:bg-danger-light hover:text-danger transition-colors"
                                                    aria-label={t('bookmarks.removeFromList')}
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <Paragraph size="sm">
                                                    {t('bookmarks.removeFromList')}
                                                </Paragraph>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {proposals.data && proposals.data.length > 0 && 'current_page' in proposals && (
                <div className="border-t border-gray-200 px-4 py-4">
                    <Paginator
                        pagination={proposals}
                        linkProps={{}}
                    />
                </div>
            )}
        </div>
    );
};

export default ListProposalsTable;
