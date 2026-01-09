import Graph from '@/Components/Graph';
import { Head, WhenVisible } from '@inertiajs/react';
import CatalystProfileLayout from '../CatalystProfileLayout';
import ConnectionData = App.DataTransferObjects.ConnectionData;
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;

interface ConnectionPageProps {
    connections: ConnectionData;
    catalystProfile: CatalystProfileData;
}

export default function Connections({
    connections,
    catalystProfile,
}: ConnectionPageProps) {
    return (
        <CatalystProfileLayout catalystProfile={catalystProfile}>
            <Head title={`${catalystProfile.name} - Connections`} />

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
        </CatalystProfileLayout>
    );
}
