import Paragraph from '@/Components/atoms/Paragraph'; // Added import for Paragraph component
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import CompletedProposalCard from './CompletedProposalCard';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalListProps {
    proposals: PaginatedData<ProposalData[]>;
    onProposalClick?: (proposalHash: string | null) => void;
}

const ProposalList: React.FC<ProposalListProps> = ({
    proposals,
    onProposalClick,
}) => {
    const { t } = useTranslation();

    if (proposals?.data && !proposals?.data.length) {
        return (
            <div className="text-dark lg:mt-8 m-4 rounded-lg border border-gray-200 lg:p-4 p-4 text-center">
                <Paragraph>
                    {t('profileWorkflow.noProposalsAvailable')}
                </Paragraph>
            </div>
        );
    }

    
    return (
        <div className="lg:mt-4 space-y-2 lg:space-y-3 lg:p-6 p-4">
            {proposals?.data &&
                proposals?.data.map((proposal, index) => (
                    <div className="w-full" key={index}>
                        <input
                            type="radio"
                            id={proposal.hash as string | undefined}
                            name="hosting"
                            value="hosting-small"
                            className="peer hidden"
                            required
                            onChange={() =>
                                onProposalClick &&
                                onProposalClick(proposal.hash)
                            }
                            disabled={!!proposal?.nft?.minted_at}
                        />
                        <label
                            htmlFor={proposal.hash as string | undefined}
                            className={`peer-checked:border-primary peer-checked:text-primary peer-checked:border-primary inline-flex w-full ${proposal?.nft?.minted_at ? 'cursor-not-allowed' : 'cursor-pointer'} items-center justify-between rounded-lg border border-gray-100 text-gray-500 peer-checked:border-2`}
                        >
                            <CompletedProposalCard proposal={proposal} />
                        </label>
                    </div>
                ))}

            {/* Pagination */}
            {/* <div className="mt-6 flex w-full items-center justify-between overflow-x-auto">
                {proposals && (
                    <Paginator
                        pagination={proposals}
                        linkProps={{
                            preserveScroll: true,
                            preserveState: true,
                        }}
                    />
                )}
            </div> */}
        </div>
    );
};

export default ProposalList;
