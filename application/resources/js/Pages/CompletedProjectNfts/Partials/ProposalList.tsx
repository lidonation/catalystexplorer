import { useTranslation } from "react-i18next";

interface Proposal {
    title: string;
    budget: number;
    fund: string;
    campaign: string;
}

interface ProposalListProps {
    proposals: Proposal[];
}

const ProposalList: React.FC<ProposalListProps> = ({ proposals }) => {
    const { t } = useTranslation();

    if (!Array.isArray(proposals) || proposals.length === 0) {
        return (
            <div className="p-4 mt-8 text-center border border-gray-200 rounded-lg text-dark">
                <p>{t("profileWorkflow.noProfilesAvailable")}</p>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-3">
            {proposals.map((proposal, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                    <h4 className="font-bold">{proposal.title}</h4>
                    <p className="text-sm">
                        <strong>{t("profileWorkflow.budget")}:</strong> <span className="text-green-600"> {proposal.budget} ₳ &nbsp; </span>
                        <strong>{t("profileWorkflow.fund")}:</strong> <span className="text-primary"> {proposal.fund} &nbsp; </span>
                        <strong>{t("profileWorkflow.campaign")}:</strong> <span> {proposal.campaign} </span>
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ProposalList;
