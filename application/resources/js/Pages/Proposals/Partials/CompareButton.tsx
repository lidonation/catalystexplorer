import CompareIcon from '@/Components/svgs/CompareIcon';
import ToolTipHover from '@/Components/ToolTipHover';
import { IndexedDBService } from '@/Services/IndexDbService';
import { useLiveQuery } from 'dexie-react-hooks';
import { getUuid } from '@/utils/getPreferredId';
import ProposalData = App.DataTransferObjects.ProposalData;
import { useState } from 'react';
type CompareButtonProps = {
    model: string;
    hash: string;
    tooltipDescription: string;
    data: ProposalData;
    'data-testid'?: string;
};
const CompareButton: React.FC<CompareButtonProps> = ({
    data,
    tooltipDescription = 'Compare proposal',
    'data-testid': dataTestId,
}: CompareButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const proposalId = data.id ?? '';
    
    // Live query to check if the proposal is already in the DB
    const existingProposal = useLiveQuery(
        async () => await IndexedDBService.get('proposal_comparisons', proposalId),
        [proposalId],
    );
    const alreadyExists = !!existingProposal;
    const toggleInList = async () => {
        if (alreadyExists) {
            await IndexedDBService.remove(
                'proposal_comparisons',
                proposalId,
            );
        } else {
            await IndexedDBService.create('proposal_comparisons', data);
        }
    };
    return (
        <button
            type="button"
            className="relative hover:cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={toggleInList}
            data-testid={dataTestId}
        >
            <CompareIcon
                exists={alreadyExists}
            />
            {isHovered && (
                <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform">
                    <ToolTipHover props={tooltipDescription} />
                </div>
            )}
        </button>
    );
};
export default CompareButton;