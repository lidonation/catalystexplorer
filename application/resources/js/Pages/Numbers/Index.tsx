import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

const Index = () => {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title={t('Numbers')} />

            <header>
                <div className="container">
                    <Title>{t('numbers')}</Title>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level="2">{t('comingSoon')}</Title>
            </div>
        </>
    );
};

export default Index;
