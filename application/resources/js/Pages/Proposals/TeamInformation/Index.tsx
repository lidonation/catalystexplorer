import Graph from '@/Components/Graph';
import { Head, WhenVisible } from '@inertiajs/react';
import ProposalLayout from '../ProposalLayout';
import ConnectionData = App.DataTransferObjects.ConnectionData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface ConnectionPageProps {
    connections: ConnectionData;
    proposal: ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
}

export default function Connections({
    connections,
    proposal,
    globalQuickPitchView,
    setGlobalQuickPitchView,
}: ConnectionPageProps) {
    return (
        <ProposalLayout
            proposal={proposal}
            globalQuickPitchView={globalQuickPitchView}
            setGlobalQuickPitchView={setGlobalQuickPitchView}
        >
            <Head title={`${proposal.title} - Connections`} />

            <WhenVisible
                data="connections"
                fallback={
                    <div className="py-4 text-center">Loading Connections</div>
                }
            >
                <div className="w-full">
                    {typeof connections !== 'undefined' && (
                        <div className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <div className="h-[500px] w-full min-w-[300px] sm:h-[400px] md:h-[500px]">
                                <Graph graphData={connections} />
                            </div>
                        </div>
                    )}
                </div>
            </WhenVisible>
        </ProposalLayout>
    );
}
