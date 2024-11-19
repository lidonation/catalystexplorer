import React from "react";
import ProposalCard from "@/Pages/Proposals/Partials/ProposalCard";
import SecondaryButton from "@/Components/SecondaryButton";
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    proposals: ProposalData[]
}

const ProposalList: React.FC<ProposalProps> = ({ proposals }) => {
    return (
        <section className="proposals-wrapper">
            <div className="container py-8 flex justify-between items-center">
                <div>
                    <h2 className="title-2">Proposals</h2>
                    <p className="text-4">Proposal votes must be submitted in the official Catalyst Voting App</p>
                </div>
                <div>
                    <SecondaryButton className="font-bold ">
                        See more proposals
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