import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import MyLayout from "@/Pages/My/MyLayout";
import GroupData = App.DataTransferObjects.GroupData;
import { PaginatedData } from '../../../../types/paginated-data';
import GroupsList from './Partials/GroupsList';
import Paginator from '@/Components/Paginator';

interface MyGroupsProps extends Record<string, unknown> {
    groups?: PaginatedData<GroupData[]>;
}

export default function MyGroups({groups}: MyGroupsProps) {
    const { t } = useTranslation();
    console.log(groups);
    return (
        <MyLayout >
            <Head title="My Groups" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-content">
                    <GroupsList groups={groups?.data ?? []} />
                </div>
            </div>
                {groups && (
                    <Paginator
                        pagination={groups}
                    />
                )}
        </MyLayout>
    );
}
