import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import IdeascaleProfileCard from './Partials/IdeascaleProfileCard';
import PeopleData = App.DataTransferObjects.IdeascaleProfileData;

interface PeoplePageProps extends Record<string, unknown> {
    people: PeopleData[];
}

const Index = ({ people }: PageProps<PeoplePageProps>) => {
    return (
        <>
            <Head title="People" />

            <header>
                <div className="container">
                    <h1 className="title-1">People</h1>
                </div>
                <div className="container">
                    <p className="text-content">
                        Search proposals and challenges by title, content, or
                        author and co-authors
                    </p>
                </div>
            </header>

            <div className="flex w-full flex-col items-center">
                <section className="container py-8">
                    <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {people.map((user, index) => (
                            <li key={index}>
                                <IdeascaleProfileCard ideascaleProfile={user} />
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    );
};

export default Index;
