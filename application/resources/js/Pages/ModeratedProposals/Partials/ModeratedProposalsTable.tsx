import React from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { PaginatedData } from '@/types/paginated-data';
import Paginator from '@/Components/Paginator';
import Paragraph from '@/Components/atoms/Paragraph';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ModeratedProposalsTableProps {
    proposals: PaginatedData<ProposalData[]>;
}

const ModeratedProposalsTable: React.FC<ModeratedProposalsTableProps> = ({
    proposals,
}) => {
    const { t } = useLaravelReactI18n();

    // Format currency
    const formatCurrency = (amount: number | null, currency: string): string => {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
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
                                <span className="text-content/60">{t('moderatedProposals.reason')}</span>
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
                        </tr>
                    </thead>
                    <tbody>
                        {proposals.data.map((proposal, index) => {
                            const moderatedReason = proposal.meta_info?.moderated_reason;
                            const catalystAppUrl = proposal.meta_info?.catalyst_app_url;
                            
                            return (
                                <tr
                                    key={proposal.id}
                                    className={index < proposals.data.length - 1 ? 'border-b border-gray-200' : ''}
                                >
                                    <td className="border-gray-200 border-b border-r px-4 py-4 text-content last:border-r-0">
                                        <div className="flex flex-col gap-1">
                                            <Paragraph className="text-md text-content font-medium">
                                                {proposal.title}
                                            </Paragraph>
                                            {catalystAppUrl && (
                                                <a
                                                    href={catalystAppUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:text-primary-hover"
                                                >
                                                    View on Catalyst App →
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="border-gray-200 border-b border-r px-4 py-4 text-content last:border-r-0">
                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                            {moderatedReason || 'Not specified'}
                                        </span>
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
                                </tr>
                            );
                        })}
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

export default ModeratedProposalsTable;
