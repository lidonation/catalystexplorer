import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <>
            <Head title="404 - Not Found" />
            
            <div className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-[#1C222B] dark:bg-[#1C222B]">
                <div className="flex items-center gap-4 text-4xl text-white dark:text-white">
                    <span className="font-medium">404</span>
                    <span className="text-white/50 dark:text-white/50">|</span>
                    <span>NOT FOUND</span>
                </div>
            </div>
        </>
    );
}
