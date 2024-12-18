import { Head } from '@inertiajs/react';
import PeopleCard from './Partials/PeopleCard';
import PeopleFilters from './Partials/PeopleFilters';
import { useTranslation } from 'react-i18next';
import PeopleData = App.DataTransferObjects.IdeascaleProfileData;
import { PageProps } from '@/types';

interface PeoplePageProps extends Record<string, unknown> {
    people: PeopleData[];
}

const Index = ({ people }: PageProps<PeoplePageProps>) => {
    const { t } = useTranslation();
    return (
        <>
            <Head title="People" />

            <header className="container">
                <h1 className="title-1">{t('people.people')}</h1>
                <p className="text-content">{t('people.pageSubtitle')}</p>
            </header>

            <section className="container flex w-full flex-col items-center justify-center py-8">
                <PeopleFilters />
            </section>

            <div className="flex flex-col w-full items-center">
                <section className="container py-8">
                    <ul className="w-full grid grid-cols-1 lg:grid-cols-5 md:grid-cols-2 gap-4">
                        {people.map((user, index) => (
                            <li key={index}>
                                <PeopleCard
                                    profilePhotoUrl={user.profile_photo_url}
                                    name={user.name}
                                    ownProposals={10}
                                    coProposals={10}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    );
};

export default Index;
