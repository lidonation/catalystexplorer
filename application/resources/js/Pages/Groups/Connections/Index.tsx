import React from 'react';
import { Head, WhenVisible } from '@inertiajs/react';
import GroupLayout from "../GroupLayout";
import ConnectionData = App.DataTransferObjects.ConnectionData;
import GroupData = App.DataTransferObjects.GroupData;
import Graph from '@/Components/Graph';

interface ConnectionPageProps {
    connections: ConnectionData;
    group: GroupData;
}

export default function Connections({ connections, group }: ConnectionPageProps) {
    return (
        <GroupLayout group={group}>
            <Head title={`${group.name} - Connections`} />

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
        </GroupLayout>
    );
}
