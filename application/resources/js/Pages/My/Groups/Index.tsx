import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import MyLayout from "@/Pages/My/MyLayout";
import GroupData = App.DataTransferObjects.GroupData;
import { PaginatedData } from '../../../../types/paginated-data';
import MyGroupsList from './Partials/MyGroupsList';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import { SearchParams } from '../../../../types/search-params';

interface MyGroupsProps extends Record<string, unknown> {
    groups: PaginatedData<GroupData[]>;
    filters: SearchParams;
}

export default function MyGroups({ groups, filters }: MyGroupsProps) {
    const { t } = useTranslation();
    return (
        <FiltersProvider defaultFilters={filters ?? {}}>

            <MyLayout>
                <Head title="My Groups" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-content">
                        <MyGroupsList groups={groups?.data || []} />
                    </div>
                </div>

                {groups && groups.total > 0 && (
                    <section className="w-full px-4 lg:container lg:px-0">
                        <Paginator pagination={groups} />
                    </section>
                )}
            </MyLayout>
        </FiltersProvider>
    );
}