import Title from '@/Components/atoms/Title';
import Error404Icon from '@/Components/svgs/Error404Icon';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head, Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function Error404() {
    const { t } = useLaravelReactI18n();

    return (
        <div className="bg-background-dark flex h-screen flex-col items-center justify-center gap-4">
            <Head title="404 Not Found" />
            <Title level="1">404</Title>
            <Error404Icon />
            <p className="text-content mt-4 flex flex-col items-center gap-2 text-sm md:text-xl">
                <span>{t('error404.mainText')}</span>
                <span>{t('error404.subText')}</span>
            </p>
            <div className="flex justify-center p-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <Link
                        href={useLocalizedRoute('home')}
                        className="bg-primary text-content mt-6 rounded px-8 py-4 text-center hover:opacity-75"
                    >
                        {t('Home')}
                    </Link>
                    <Link
                        href={useLocalizedRoute('proposals.index')}
                        className="bg-primary text-content mt-6 rounded px-8 py-4 text-center hover:opacity-75"
                    >
                        {t('proposals.proposals')}
                    </Link>
                    <Link
                        href={useLocalizedRoute('funds.index')}
                        className="bg-primary text-content mt-6 rounded px-8 py-4 text-center hover:opacity-75"
                    >
                        {t('funds.funds')}
                    </Link>
                    {/* <Link
                        href={'/'}
                        className="bg-primary text-content mt-6 rounded px-8 py-4 text-center hover:opacity-75"
                    >
                        {t('knowledgeBase')}
                    </Link> */}
                </div>
            </div>
        </div>
    );
}
