import Title from '@/Components/atoms/Title';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function ComingSoon({context = ''}:{context:string}) {
    const { t } = useTranslation();

    return (
        <div className="bg-background-dark flex h-screen flex-col items-center justify-center gap-4">
            <Head title="Comming Soon" />
            <Title level="1">{context+' '}Comming Soon...</Title>
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
