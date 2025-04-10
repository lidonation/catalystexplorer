import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import MyLayout from '@/Pages/My/MyLayout';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import { SearchParams } from '../../../../types/search-params';
import MyGroupsList from './Partials/MyGroupsList';
import GroupData = App.DataTransferObjects.GroupData;
import GroupCardExtendedLoader from '@/Pages/Groups/Partials/GroupCardExtendedLoader';

interface MyGroupsProps extends Record<string, unknown> {
    groups: PaginatedData<GroupData[]>;
    filters: SearchParams;
}

export default function MyGroups({ groups, filters }: MyGroupsProps) {
    const { t } = useTranslation();
    return (
        <FiltersProvider
            defaultFilters={filters ?? {}}
            routerOptions={{ only: 'groups' }}
        >
            <MyLayout>
                <Head title="My Groups" />

                <div className="container mb-8">
                    <WhenVisible
                        fallback={<GroupCardExtendedLoader />}
                        data="groups"
                    >
                        <MyGroupsList groups={groups?.data || []} />
                    </WhenVisible>
                </div>

                {groups && groups.total > 0 && (
                    <section className="w-full container">
                        <Paginator pagination={groups} />
                    </section>
                )}
            </MyLayout>
        </FiltersProvider>
    );
}
