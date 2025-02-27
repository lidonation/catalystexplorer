import Paragraph from '@/Components/atoms/Paragraph'; // Added import for Paragraph component
import Paginator from '@/Components/Paginator';
import { currency } from '@/utils/currency';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import ProposalData = App.DataTransferObjects.ProposalData;
import CompletedProposalCard from './CompletedProposalCard';

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

    useEffect(()=>{
        console.log('proposals', proposals)
    })

    return (
        <div className="mt-4 space-y-3">
            {proposals?.data.map((proposal, index) => (
                <CompletedProposalCard proposal={proposal} key={index} />
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
