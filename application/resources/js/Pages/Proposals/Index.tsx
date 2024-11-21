import { Head } from '@inertiajs/react';
import {useTranslation} from "react-i18next";

const Index = () => {
    const { t } = useTranslation();
    return (
        <>
            <Head title="Proposals" />

            <header>
                <div className='container'>
                    <h1 className="title-1">{t('proposals.proposals')}</h1>
                </div>
                <div className='container'>
                    <p className="text-content">
                        {t('proposals.pageSubtitle')}
                    </p>
                </div>
            </header>

            <div className="flex flex-col h-screen w-full items-center justify-center">
                <h1>Proposals</h1>
            </div>
        </>
    );
};

export default Index;
