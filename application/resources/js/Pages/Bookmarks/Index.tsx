import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

const Index = () => {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('listsAndBookmarks')}/>

            <header>
                <div className='container'>
                    <Title>{t('listsAndBookmarks')}</Title>
                    
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level='2'>{t('comingSoon')}</Title>
            </div>
        </>
    );
};

export default Index;