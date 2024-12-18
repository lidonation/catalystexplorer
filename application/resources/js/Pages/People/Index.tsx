import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import IdeascaleProfilesList from './Partials/IdeascaleProfileList';
import PeopleFilters from './Partials/PeopleFilters';
import { useTranslation } from 'react-i18next';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;
import { useEffect } from 'react';

interface PeoplePageProps extends Record<string, unknown> {
    people: IdeascaleProfilesData[];
}
const Index = ({ people }: PageProps<PeoplePageProps>) => {
    const { t } = useTranslation();
    useEffect(()=>{
        console.log('people', people);
    })
    return (
        <>
            <Head title="People" />
            <Head title="People" />

            <header className="container">
                <h1 className="title-1">{t('people.people')}</h1>
                <p className="text-content">{t('people.pageSubtitle')}</p>
            </header>

            <section className="container flex w-full flex-col items-center justify-center py-8">
                <PeopleFilters />
            </section>

            <div className="flex w-full flex-col items-center">
                <section className="container py-8">
                  <IdeascaleProfilesList ideascaleProfiles={people}/>  
                </section>
            </div>
        </>
    );
};

export default Index;
