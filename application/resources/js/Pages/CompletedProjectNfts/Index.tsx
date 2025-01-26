import LoginForm from '@/Components/LoginForm';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

const Index = () => {
    const { t } = useTranslation();
    return (
        <>
            <Head title="Charts" />

            <header>
                <div className="container">
                    <h1 className="title-1">{t("completedProjectNfts.title")}</h1>
                </div>
                <div className="container">
                    <p className="text-content">
                        {t("completedProjectNfts.subtitle")}
                    </p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <LoginForm title={`${t("completedProjectNfts.nowMinting")}: ${t("funds.funds")} 2-12`} />
            </div>
        </>
    );
};

export default Index;
