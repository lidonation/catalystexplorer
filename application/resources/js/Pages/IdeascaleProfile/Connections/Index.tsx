import React from 'react';
import { Head, WhenVisible } from '@inertiajs/react';
import ConnectionData = App.DataTransferObjects.ConnectionData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import Graph from '@/Components/Graph';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';

interface ConnectionPageProps {
    connections: ConnectionData;
    ideascaleProfile: IdeascaleProfileData;
}

export default function Connections({ connections, ideascaleProfile }: ConnectionPageProps) {
    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Connections`} />

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
        </IdeascaleProfileLayout>
    );
}
