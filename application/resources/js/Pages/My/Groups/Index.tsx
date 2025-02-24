import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import MyLayout from "@/Pages/My/MyLayout";
import GroupData = App.DataTransferObjects.GroupData;

import GroupCardExtended from '@/Pages/Groups/Partials/GroupCardExtended';
import GroupsList from './Partials/GroupsList';

interface MyGroupsProps {
    groups?: GroupData[];
}

export default function MyGroups({groups}: MyGroupsProps) {
    const { t } = useTranslation();
    console.log(groups);
    return (
        <MyLayout >
            <Head title="My Groups" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-content">
                    <GroupsList groups={groups ?? []} />
                </div>
            </div>
        </MyLayout>
    );
}
