import React from "react";
import ProposalCard from "@/Pages/Proposals/Partials/ProposalCard";
import { router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    proposals: ProposalData[]
}

const ProposalResults: React.FC<ProposalProps> = ({ proposals }) => {
    const {t} = useTranslation();
    function navigate (){
       router.get('/proposals')
    }
    return (
        <section className="proposals-wrapper">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:max-w-full">
                {proposals &&
                    proposals.map((proposal) => (
                        <ProposalCard
                            key={proposal.id}
                            proposal={proposal}
                        />
                    ))}
            </div>
        </section>
    )
}

export default ProposalResults;
