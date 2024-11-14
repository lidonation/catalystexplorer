import SearchBar from '@/Components/SearchBar';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import PostCard from "@/Pages/Posts/Partials/PostCard";


export default function Welcome({ }: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="Catalyst Explorer" />

            <div className="flex flex-col gap-8 w-full justify-center">
                <section className='splash-wrapper  py-16'>
                    <div className='container'>
                        <SearchBar autoFocus/>
                    </div>
                </section>

                <section className='numbers-werapper py-16'>

                </section>

                <section className='propoals-wrapper py-16'>

                </section>

                <section className='special-announcements-wrapper'>

                </section>

                <section className='posts-wrapper'>
                    <div className='flex content-gap flex-nowrap overflow-x-scroll container'>
                        <PostCard/>
                        <PostCard/>
                        <PostCard/>
                    </div>
                </section>
            </div>
        </>
    );
}
