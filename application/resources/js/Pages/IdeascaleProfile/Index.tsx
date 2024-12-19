import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import IdeascaleProfilesList from './Partials/IdeascaleProfileList';
import IdeascaleProfilesFilters from './Partials/IdeascaleProfilesFilters';
import { useTranslation } from 'react-i18next';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
    ideascaleProfiles: IdeascaleProfilesData[];
}
const Index = ({ ideascaleProfiles }: PageProps<IdeascaleProfilesPageProps>) => {

    const { t } = useTranslation();

    return (
        <>
            <Head title="Ideascale Profiles" />

            <header className="container">
                <h1 className="title-1">{t('ideascaleProfiles.ideascaleProfiles')}</h1>
                <p className="text-content">{t('ideascaleProfiles.pageSubtitle')}</p>
            </header>

            <section className="container flex w-full flex-col items-center justify-center py-8">
                <IdeascaleProfilesFilters />
            </section>

            <div className="flex w-full flex-col items-center">
                <section className="container py-8">
                  <IdeascaleProfilesList ideascaleProfiles={ideascaleProfiles}/>
                </section>
            </div>
        </>
    );
};

export default Index;
