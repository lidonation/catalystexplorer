import Paragraph from '@/Components/atoms/Paragraph'; // Added import for Paragraph component
import Paginator from '@/Components/Paginator';
import { currency } from '@/utils/currency';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalListProps {
    proposals: PaginatedData<ProposalData[]>;
}

const ProposalList: React.FC<ProposalListProps> = ({ proposals }) => {
    const { t } = useTranslation();

    if (!Array.isArray(proposals.data) || proposals.data.length === 0) {
        return (
            <div className="text-dark mt-8 rounded-lg border border-gray-200 p-4 text-center">
                <Paragraph>
                    {t('profileWorkflow.noProposalsAvailable')}
                </Paragraph>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-3">
            {proposals?.data.map((proposal, index) => (
                <div
                    key={proposal.hash}
                    className="rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                    <h4 className="font-bold">{proposal.title}</h4>
                    <Paragraph className="text-sm">
                        <strong>{t('profileWorkflow.budget')}:</strong>{' '}
                        <span className="text-success">
                            {' '}
                            {currency(
                                proposal.amount_requested ?? 0,
                                undefined,
                                proposal?.currency,
                            )}{' '}
                            &nbsp;{' '}
                        </span>
                        <strong>{t('profileWorkflow.fund')}:</strong>{' '}
                        <span className="text-primary">
                            {' '}
                            {proposal.fund?.label} &nbsp;{' '}
                        </span>
                        <strong>{t('profileWorkflow.campaign')}:</strong>{' '}
                        <span> {proposal.campaign?.label} </span>
                    </Paragraph>
                </div>
            ))}

            {/* Pagination */}
            <div className="mt-6 flex w-full items-center justify-between overflow-x-auto">
                {proposals && (
                    <Paginator
                        pagination={proposals}
                        linkProps={{
                            preserveScroll: true,
                            preserveState: true,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ProposalList;
