import SearchBar from '@/Components/SearchBar';
import {PageProps} from '@/types';
import {Head, WhenVisible} from '@inertiajs/react';
import PostCard from "@/Pages/Posts/Partials/PostCard";
import CatalystIntro from "@/Pages/Home/Partials/CatalystIntro";


export default function Index({posts}: PageProps<{ posts: any; }>) {
    return (
        <>
            <Head title="Catalyst Explorer"/>

            <CatalystIntro />

            <div className="flex flex-col gap-8 w-full justify-center">
                <section className='splash-wrapper py-4 sticky top-4'>
                    <div className='container'>
                        <SearchBar autoFocus/>
                    </div>
                </section>

                <section className="numbers-werapper py-16"></section>

                <section className="propoals-wrapper py-16"></section>

                <section className="special-announcements-wrapper"></section>

                <WhenVisible fallback='loading pulse here' data="posts">
                    <section className='posts-wrapper'>
                        <div className='container py-8 max-h-80 overflow-auto'>
                            <h2 className='title-2'>Your data:</h2>
                            {JSON.stringify(posts)}
                        </div>
                        <div className='flex content-gap flex-nowrap overflow-x-scroll container'>
                            <PostCard/>
                            <PostCard/>
                            <PostCard/>
                        </div>
                    </section>
                </WhenVisible>
            </div>
        </>
    );
}
