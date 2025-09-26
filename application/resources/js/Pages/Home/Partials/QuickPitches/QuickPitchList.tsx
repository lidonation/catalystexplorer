import QuickPitchCard from "./QuickPitchCard";

interface QuickPitchListProps {
    quickPitches?: {
        featured: App.DataTransferObjects.ProposalData[];
        regular: App.DataTransferObjects.ProposalData[];
    };
}
export default function QuickPitchList ({ quickPitches }: QuickPitchListProps) {
    if (!quickPitches) {
        return <div className="text-center text-gray-persist">No quickpitches available</div>;
    }

    const featuredArray = Array.isArray(quickPitches?.featured) ? quickPitches.featured : [];
    const regularArray = Array.isArray(quickPitches?.regular) ? quickPitches.regular : [];

    const allQuickPitches = [
        ...featuredArray,
        ...regularArray
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2  xl:grid-cols-3 gap-2">
            {
                allQuickPitches.map((quickPitch) => (
                    <QuickPitchCard key={quickPitch.id} proposal={quickPitch} thumbnail={''} />
                ))
            }
        </div>
    )
}
