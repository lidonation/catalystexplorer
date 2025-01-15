import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FundData = App.DataTransferObjects.FundData;

interface FundPageProps extends Record<string, unknown> {
    fund: FundData;
}
export default function Fund({ fund }: PageProps<FundPageProps>) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={fund.title}/>

            <div className="container">
                <h1 className="title-1">{fund.title}</h1>
            </div>

            <div className="container flex flex-col h-screen w-full items-center justify-center">
                <h1>{t('comingSoon')}</h1>
            </div>
        </>
    );
}
