import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import GroupCardExtendedLoader from '@/Pages/Groups/Partials/GroupCardExtendedLoader';
import { SearchParams } from '@/types/search-params';
import { Head, WhenVisible } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import MyGroupsList from './Partials/MyGroupsList';
import GroupData = App.DataTransferObjects.GroupData;

interface MyGroupsProps extends Record<string, unknown> {
    groups: GroupData[];
    filters: SearchParams;
}

export default function MyGroups({ groups, filters }: MyGroupsProps) {
    const { t } = useLaravelReactI18n();
    return (
        <FiltersProvider
            defaultFilters={filters ?? {}}
            routerOptions={{ only: 'groups' }}
        >
            <Head title="My Groups" />

            <div className="container space-y-8">
                {groups && groups.length > 0 ? (
                    <WhenVisible
                        fallback={<GroupCardExtendedLoader />}
                        data="groups"
                    >
                        <MyGroupsList groups={groups || []} />
                    </WhenVisible>
                ) : (
                    <div className="py-8 text-center">
                        <RecordsNotFound />
                    </div>
                )}
            </div>
        </FiltersProvider>
    );
}
