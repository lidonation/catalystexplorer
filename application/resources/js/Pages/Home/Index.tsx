import PostCard from '@/Pages/Posts/Partials/PostCard';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import CatalystIntro from './Partials/CatalystIntro';

export default function Welcome({}: PageProps<{
    laravelVersion: string;
    phpVersion: string;
}>) {
    return (
        <>
            <Head title="Catalyst Explorer" />
            <CatalystIntro />

            <div className="flex w-full flex-col justify-center gap-8">
                <section className="splash-wrapper py-16">
                    <div className="container mx-auto"></div>
                </section>

                <section className="numbers-werapper py-16"></section>

                <section className="propoals-wrapper py-16"></section>

                <section className="special-announcements-wrapper"></section>

                <section className="posts-wrapper">
                    <div className="content-gap container flex flex-nowrap overflow-x-scroll">
                        <PostCard />
                        <PostCard />
                        <PostCard />
                    </div>
                </section>
            </div>
        </>
    );
}
