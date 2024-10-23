import ThemeSwitcher from '@/Components/layout/ThemeSwitcher';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <>
            <Head title="Welcome" />
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex h-full w-full items-center justify-center">
                    <ThemeSwitcher />
                </div>
            </div>
        </>
    );
}
