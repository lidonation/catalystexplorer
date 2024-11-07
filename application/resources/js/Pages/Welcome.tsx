import {PageProps} from '@/types';
import {Head} from '@inertiajs/react';

export default function Welcome({}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="Welcome"/>
            <div className="flex h-screen w-full items-center justify-center">
                Welcome
            </div>
        </>
    );
}
