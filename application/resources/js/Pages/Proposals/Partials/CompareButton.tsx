import CompareIcon from "@/Components/svgs/CompareIcon";
import ToolTipHover from "@/Components/ToolTipHover";
import { IndexedDBService } from "@/Services/IndexDbService";
import { useState } from "react";
import ProposalData = App.DataTransferObjects.ProposalData;


type CompareButtonProps = {
    model: string;
    hash: string;
    tooltipDescription: string;
    data: ProposalData;
};

const CompareButton: React.FC<CompareButtonProps> = ({
    data,
    tooltipDescription = 'Compare proposal',
}: CompareButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const addToList = () => {
        IndexedDBService.create('proposal_comparisons', data);
    }

    return (
        <button
            type="button"
            className="relative hover:cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={addToList}
        >
            <CompareIcon />
            {isHovered && (
                <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform">
                    <ToolTipHover props={tooltipDescription} />
                </div>
            )}
        </button>
    );
};


export default CompareButton;