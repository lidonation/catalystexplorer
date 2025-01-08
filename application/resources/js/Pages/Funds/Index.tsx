import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PageProps } from '@/types';
import FundCardLoader from './Partials/FundCardLoader';
import FundsList from './Partials/FundsList';


interface HomePageProps extends Record<string, unknown> {
    funds: any;
}

export default function Index({
    funds,
}: PageProps<HomePageProps>) {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Funds" />
            <header>
                <div className='container'>
                    <h1 className="title-1">{t("funds.funds")}</h1>
                </div>
                <div className='container'>
                    <p className="text-content">
                    {t("funds.pageSubtitle")}
                    </p>
                </div>
            </header>
            <div className="flex w-full flex-col items-center">
                <section className="container py-8">
                    <WhenVisible fallback={<FundCardLoader />} data="funds">
                        <FundsList funds={funds} />
                    </WhenVisible>
                </section>
            </div>
        </>
    );
};
