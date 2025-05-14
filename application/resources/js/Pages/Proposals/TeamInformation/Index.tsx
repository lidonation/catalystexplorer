import { Head, WhenVisible } from '@inertiajs/react';
import ConnectionData = App.DataTransferObjects.ConnectionData;
import ProposalData = App.DataTransferObjects.ProposalData;
import Graph from '@/Components/Graph';
import ProposalLayout from '../ProposalLayout';

interface ConnectionPageProps {
    connections: ConnectionData;
    proposal: ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
}

export default function Connections({ connections, proposal, globalQuickPitchView, setGlobalQuickPitchView }: ConnectionPageProps) {
    return (
        <ProposalLayout
            proposal={proposal}
            globalQuickPitchView={globalQuickPitchView}
            setGlobalQuickPitchView={setGlobalQuickPitchView}
        >
            <Head title={`${proposal.title} - Connections`} />

            <WhenVisible data='connections' fallback={<div className="text-center py-4">Loading Connections</div>}>
                <div className='w-full'>
                    {typeof connections !== 'undefined' && (
                        <div className='w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-auto'>
                            <div className='min-w-[300px] w-full h-[500px] sm:h-[400px] md:h-[500px]'>
                                <Graph graphData={connections} />
                            </div>
                        </div>
                    )}
                </div>
            </WhenVisible>
        </ProposalLayout>
    );
}
