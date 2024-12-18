import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import IdeascaleProfileCard from './Partials/IdeascaleProfileCard';
import PeopleFilters from './Partials/PeopleFilters';
import { useTranslation } from 'react-i18next';
import PeopleData = App.DataTransferObjects.IdeascaleProfileData;

interface PeoplePageProps extends Record<string, unknown> {
    people: PeopleData[];
}

const Index = ({ people }: PageProps<PeoplePageProps>) => {
    const { t } = useTranslation();
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
                    <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {people.map((user, index) => (
                            <li key={index}>
                                <IdeascaleProfileCard ideascaleProfile={user} />
                            </li>
                        ))}
                    </ul>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    );
};

export default Index;
