import { Head } from '@inertiajs/react';
import { FiltersProvider } from '@/Context/FiltersContext';
import PeopleFilters from './Partials/PeopleFilters';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import PeopleData = App.DataTransferObjects.UserData;

interface HomePageProps extends Record<string, unknown> {
    people: PaginatedData<PeopleData[]>;
}

const Index: React.FC<HomePageProps> = ({ people }) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title="People" />

            <header>
                <div className='container'>
                    <h1 className="title-1">{t('people.people')}</h1>
                </div>
                <div className='container'>
                    <p className="text-content">
                        {t('people.pageSubtitle')}
                    </p>
                </div>
            </header>
            <section className="container flex w-full flex-col items-center justify-center  py-8">
                <PeopleFilters />
            </section>

            <div className="flex flex-col h-screen w-full items-center justify-center">
                <h1>People ...</h1>
            </div>
        </>
    );
};

export default Index;
