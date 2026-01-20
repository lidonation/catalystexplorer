import GlobalSearchTrigger from '@/Components/GlobalSearch/GlobalSearchTrigger';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { usePage } from '@inertiajs/react';

interface ContentHeaderProps {
    className?: string;
}

export default function ContentHeader({ className = '' }: ContentHeaderProps) {
    const { url } = usePage();

    if (
        url.includes('workflows') ||
        url.includes('dreps') ||
        url.includes('votes') ||
        url.includes('password') ||
        url.includes('login') ||
        url.includes('register')
    ) {
        return null;
    }

    return (
        <div
            className={`container flex items-center justify-center px-8 pt-6 pb-2 ${className}`}
            data-testid="content-header"
        >
            <div className="max-w-sm w-full">
                <GlobalSearchTrigger variant="content" />
            </div>
        </div>
    );
}