import { useTranslation } from "react-i18next";
import { useState } from "react";
import Paragraph from "@/Components/atoms/Paragraph";
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalListProps {
    proposals: ProposalData[];
}

const ProposalList: React.FC<ProposalListProps> = ({ proposals }) => {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(proposals.length / itemsPerPage);
    const currentProposals = proposals.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (!Array.isArray(proposals) || proposals.length === 0) {
        return (
            <div className="p-4 mt-8 text-center border border-gray-200 rounded-lg text-dark">
                <Paragraph>{t("profileWorkflow.noProfilesAvailable")}</Paragraph>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-3">
            {currentProposals.map((proposal, index) => (
                <div key={proposal.hash} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                    <h4 className="font-bold">{proposal.title}</h4>
                    <Paragraph className="text-sm">
                        <strong>{t("profileWorkflow.budget")}:</strong> <span className="text-green-600"> {proposal.amount_requested} {proposal.currency} &nbsp; </span>
                        <strong>{t("profileWorkflow.fund")}:</strong> <span className="text-primary"> {proposal.fund?.label} &nbsp; </span>
                        <strong>{t("profileWorkflow.campaign")}:</strong> <span> {proposal.campaign?.label} </span>
                    </Paragraph>
                </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center disabled:opacity-50"
                >
                    ← <span className="ml-1">{t("profileWorkflow.previous")}</span>
                </button>
                <span className="px-4 py-2 text-sm font-medium rounded-full bg-primary-light ">
                    {currentPage}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center disabled:opacity-50"
                >
                    <span className="mr-1">{t("profileWorkflow.next")}</span> →
                </button>
            </div>
        </div>
    );
};

export default ProposalList;
