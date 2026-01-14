import CompareIcon from '@/Components/svgs/CompareIcon';
import ToolTipHover from '@/Components/ToolTipHover';
import { IndexedDBService } from '@/Services/IndexDbService';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ProposalData = App.DataTransferObjects.ProposalData;
type CompareButtonProps = {
    model: string;
    hash: string;
    tooltipDescription: string;
    data: ProposalData;
    'data-testid'?: string;
    buttonTheme?: string;
};
const CompareButton: React.FC<CompareButtonProps> = ({
    data,
    tooltipDescription = 'Compare proposal',
    'data-testid': dataTestId,
    buttonTheme = 'text-white'
}: CompareButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const proposalId = data.id ?? '';

    // Live query to check if the proposal is already in the DB
    const existingProposal = useLiveQuery(
        async () =>
            await IndexedDBService.get('proposal_comparisons', proposalId),
        [proposalId],
    );
    const alreadyExists = !!existingProposal;
    const toggleInList = async () => {
        if (alreadyExists) {
            await IndexedDBService.remove('proposal_comparisons', proposalId);
        } else {
            const proposalData = {
                ...data,
                hash: proposalId,
            } as ProposalData;

            await IndexedDBService.create('proposal_comparisons', proposalData);
        }
    };

    const handleMouseEnter = () => {
        if (typeof window === 'undefined' || !buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();

        setTooltipPos({
            top: rect.top,
            left: rect.left + rect.width / 2,
        });
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTooltipPos(null);
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                className={`relative hover:cursor-pointer ${alreadyExists ? 'text-success' : buttonTheme}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={toggleInList}
                data-testid={dataTestId}
            >
                <CompareIcon exists={alreadyExists} />
            </button>

            {isHovered && tooltipPos && typeof document !== 'undefined' &&
                createPortal(
                    <div
                        className="pointer-events-none fixed z-[9999]"
                        style={{
                            top: tooltipPos.top,
                            left: tooltipPos.left,
                            transform: 'translate(-50%, -100%) translateY(-8px)',
                        }}
                    >
                        <ToolTipHover props={tooltipDescription} />
                    </div>,
                    document.body,
                )}
        </>
    );
};
export default CompareButton;
