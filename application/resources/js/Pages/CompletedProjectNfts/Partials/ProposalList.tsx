import Paragraph from '@/Components/atoms/Paragraph'; // Added import for Paragraph component
import { PaginatedData } from '@/types/paginated-data';
import {useLaravelReactI18n} from "laravel-react-i18n";
import CompletedProposalCard from './CompletedProposalCard';
import ProposalData = App.DataTransferObjects.ProposalData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface ProposalListProps {
    proposals: PaginatedData<ProposalData[]>;
    onProposalClick?: (proposalId: string | null) => void;
    profileHash: string;
}

const ProposalList: React.FC<ProposalListProps> = ({
    proposals,
    onProposalClick,
    profileHash,
}) => {
    const { t } = useLaravelReactI18n();

    if (proposals?.data && !proposals?.data.length) {
        return (
            <div className="text-dark m-4 rounded-lg border border-gray-200 p-4 text-center lg:mt-8 lg:p-4">
                <Paragraph>
                    {t('profileWorkflow.noProposalsAvailable')}
                </Paragraph>
            </div>
        );
    }

    return (
        <div className="space-y-2 p-4 lg:mt-4 lg:space-y-3 lg:p-6 overflow-y-auto max-h-96">
            {proposals?.data &&
                proposals?.data.map((proposal, index) => (
                    <div className="w-full" key={index}>
                        <input
                            type="radio"
                            id={proposal.id as string | undefined}
                            name="hosting"
                            value="hosting-small"
                            className="peer hidden"
                            disabled={!!proposal.minted_nfts_fingerprint}
                            required
                            onChange={() =>
                                onProposalClick &&
                                onProposalClick(proposal.id)
                            }
                        />
                        <label
                            htmlFor={proposal.id as string | undefined}
                            className={`peer-checked:border-primary peer-checked:text-primary peer-checked:border-primary ${proposal.minted_nfts_fingerprint ? 'cursor-not-allowed' : ''} inline-flex w-full items-center justify-between rounded-lg border border-gray-100 text-gray-500 peer-checked:border-2`}
                        >
                            <CompletedProposalCard
                                proposal={proposal}
                                profileHash={profileHash}
                            />
                        </label>
                    </div>
                ))}
        </div>
    );
};

export default ProposalList;
