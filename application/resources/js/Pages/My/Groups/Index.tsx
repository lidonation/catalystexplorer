import { FiltersProvider } from '@/Context/FiltersContext';
import GroupCardExtendedLoader from '@/Pages/Groups/Partials/GroupCardExtendedLoader';
import MyLayout from '@/Pages/My/MyLayout';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { SearchParams } from '../../../types/search-params';
import MyGroupsList from './Partials/MyGroupsList';
import GroupData = App.DataTransferObjects.GroupData;

interface MyGroupsProps extends Record<string, unknown> {
    groups: GroupData[];
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
                        <MyGroupsList groups={groups || []} />
                    </WhenVisible>
                </div>
            </MyLayout>
        </FiltersProvider>
    );
}
