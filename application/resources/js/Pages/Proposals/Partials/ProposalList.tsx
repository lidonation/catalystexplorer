import React from "react";
import ProposalCard from "@/Pages/Proposals/Partials/ProposalCard";
import SecondaryButton from "@/Components/SecondaryButton";
import { router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    proposals: ProposalData[]
}

const ProposalList: React.FC<ProposalProps> = ({ proposals }) => {
    const {t} = useTranslation();
    function navigate (){
       router.get('/proposals')
    }
    return (
        <section className="proposals-wrapper">
            <div className="container py-8 flex justify-between items-center">
                <div>
                    <h2 className="title-2">{t("proposals")}</h2>
                    <p className="text-4 text-content-dark opacity-70">{t("proposalList.subtitle")}</p>
                </div>
                <div>
                    <SecondaryButton className="font-bold text-content-dark" onClick={navigate}>
                    {t("proposalList.buttonText")} {t("proposals")}
                    </SecondaryButton>
                </div>
            </div>
            <div className="container mx-auto grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:max-w-full">
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

export default ProposalList;
