import SearchBar from '@/Components/SearchBar';
import {PageProps} from '@/types';
import {Head, WhenVisible} from '@inertiajs/react';
import PostCard from "@/Pages/Posts/Partials/PostCard";
import CatalystIntro from "@/Pages/Home/Partials/CatalystIntro";


export default function Index({posts}: PageProps<{ posts: any; }>) {
    return (
        <>
            <Head title="Catalyst Explorer"/>

            <div className="relative flex flex-col gap-8 w-full justify-center">
                <CatalystIntro/>

                <section className="numbers-werapper py-16"></section>

                <section className="propoals-wrapper py-16"></section>

                <section className="special-announcements-wrapper"></section>

                <WhenVisible fallback='loading pulse here' data="posts">
                    <section className='posts-wrapper'>
                        <div className='container py-8 max-h80 overflow-auto'>
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
