import Title from '@/Components/atoms/Title';
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
                    <Title level='1'>{t('activeFund')}</Title>
                </div>
                <div className="container">
                    <p className="text-content">{t('activeFund')}</p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level='2'>{t('comingSoon')}</Title>
            </div>
        </>
    );
};

export default Index;
