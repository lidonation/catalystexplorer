import { Head, WhenVisible } from '@inertiajs/react';
import { PaginatedData } from '../../../types/paginated-data';
import GroupLayout from '../GroupLayout';
import LocationData = App.DataTransferObjects.LocationData;
import GroupData = App.DataTransferObjects.GroupData;

interface LocationPageProps {
    locations: PaginatedData<LocationData[]>;
    group: GroupData;
}

export default function Locations({ locations, group }: LocationPageProps) {
    return (
        <GroupLayout group={group}>
            <Head title={`${group.name} - Connections`} />

            <WhenVisible
                data="locations"
                fallback={<div>Loading Locations</div>}
            >
                <div className="w-full overflow-auto">
                    {typeof locations?.data !== 'undefined' && (
                        <div className="max-w-full lg:max-w-lg">
                            {JSON.stringify(locations?.data)}
                        </div>
                    )}
                </div>
            </WhenVisible>
        </GroupLayout>
    );
}
