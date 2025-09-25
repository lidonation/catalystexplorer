import QuickPitchCard from "./QuickPitchCard";

interface QuickPitchListProps {
    quickPitches?: App.DataTransferObjects.ProposalData[];
}
export default function QuickPitchList ({ quickPitches }: QuickPitchListProps) {
    return (
        <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
            {
                quickPitches?.map((quickPitch) => (
                    <QuickPitchCard key={quickPitch.id} proposal={quickPitch} thumbnail={''} />
                ))
            }
        </div>
    )
}