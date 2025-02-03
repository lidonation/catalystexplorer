import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface ActiveFundsProp extends Record<string, unknown> {
    search?: string | null;
}

const Index: React.FC<ActiveFundsProp> = ({ search }) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Groups" />

            <header>
                <div className="container">
                    <h1 className="title-1">{t('activeFund')}</h1>
                </div>
                <div className="container">
                    <p className="text-content">{t('activeFund')}</p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <h1>{t('comingSoon')}</h1>
            </div>
        </>
    );
};

export default Index;
