import { Head } from '@inertiajs/react';
import PeopleCard from './Partials/PeopleCard';
import PeopleData = App.DataTransferObjects.IdeascaleProfileData;
import { useEffect } from 'react';
import { PageProps } from '@/types';

interface PeoplePageProps extends Record<string, unknown>{
    people: PeopleData[]
}


const Index = ({people}: PageProps<PeoplePageProps>) => {
    useEffect(()=>{
        console.log(people)
    })
    return (
        <>
            <Head title="People"/>

            <header>
                <div className='container'>
                    <h1 className="title-1">People</h1>
                </div>
                <div className='container'>
                    <p className="text-content">
                        Search proposals and challenges by title, content, or author and co-authors
                    </p>
                </div>
            </header>

            <div className="flex flex-col w-full items-center">
                <section className='container py-8'>
                  <ul className='w-full grid grid-cols-1 lg:grid-cols-5 md:grid-cols-2 gap-4'>
                    {
                        people.map((user, index)=>(
                            <li key={index}>
                                <PeopleCard profilePhotoUrl={user.profile_photo_url} name={user.name} ownProposals={10} coProposals={10}/>
                            </li>
                        ))
                    }
                  </ul>
                </section>
            </div>
        </>
    );
};

export default Index;
