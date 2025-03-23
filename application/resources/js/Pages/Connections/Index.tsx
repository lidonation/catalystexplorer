import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import Paragraph from '@/Components/atoms/Paragraph';
import { useTranslation } from 'react-i18next';

const Index = () => {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('connections')}/>

            <header>
                <div className='container'>
                    <Title>{t('connections')}</Title>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level='2'>{t('comingSoon')}</Title>
            </div>
        </>
    );
};

export default Index;