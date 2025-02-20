import { Head, WhenVisible } from '@inertiajs/react';
import MyLayout from "../MyLayout";
import LocationData = App.DataTransferObjects.LocationData;
import GroupData = App.DataTransferObjects.GroupData;
import { PaginatedData } from '../../../../types/paginated-data';

interface LocationPageProps {
    locations: PaginatedData<LocationData[]>;
    group: GroupData;
}

export default function Locations({ locations, group }: LocationPageProps) {
    return (
        <MyLayout group={group}>
            <Head title={`${group.name} - Connections`} />
            
            <WhenVisible data='locations' fallback={<div>Loading Locations</div>}>
                <div className='w-full overflow-auto'>
                    {typeof locations?.data !== 'undefined' && (
                        <div className='max-w-full lg:max-w-lg'>
                            {JSON.stringify(locations?.data)}
                        </div>
                    )}
                </div>
            </WhenVisible>
        </MyLayout>
    );
}
