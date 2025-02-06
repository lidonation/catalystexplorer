import Error404Icon from '@/Components/svgs/Error404Icon';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Error404() {
    const { t } = useTranslation();

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-100">
            <Head title="404 Not Found" />
            <Error404Icon />
            <p className="mt-4 flex flex-col items-center gap-2 text-sm text-gray-600 md:text-xl">
                <span>{t('error404.mainText')}</span>
                <span>{t('error404.subText')}</span>
            </p>
            <div className="flex justify-center p-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Link
                        href={useLocalizedRoute('home')}
                        className="bg-primary mt-6 rounded bg-blue-600 px-8 py-4 text-center text-white hover:opacity-75"
                    >
                        {t('Dashboard')}
                    </Link>
                    <Link
                        href={useLocalizedRoute('proposals.index')}
                        className="bg-primary mt-6 rounded bg-blue-600 px-8 py-4 text-center text-white hover:opacity-75"
                    >
                        {t('proposals.proposals')}
                    </Link>
                    <Link
                        href={useLocalizedRoute('funds.index')}
                        className="bg-primary mt-6 rounded bg-blue-600 px-8 py-4 text-center text-white hover:opacity-75"
                    >
                        {t('funds.funds')}
                    </Link>
                    <Link
                        href={'/'}
                        className="bg-primary mt-6 rounded bg-blue-600 px-8 py-4 text-center text-white hover:opacity-75"
                    >
                        {t('knowledgeBase')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
