import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import {useTranslation} from "react-i18next";

const Index = () => {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Jormungandr"/>

            <header>
                <div className='container'>
                    <Title level='1'>Jormungandr</Title>
                </div>
                <div className='container'>
                    <p className="text-content">
                        Search proposals and challenges by title, content, or author and co-authors
                    </p>
                </div>
            </header>

            <div className="flex flex-col h-screen w-full items-center justify-center">
                <Title level='2'>{t('comingSoon')}</Title>
            </div>
        </>
    );
};

export default Index;
