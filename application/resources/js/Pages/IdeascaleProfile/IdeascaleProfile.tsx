import {PageProps} from '@/types';
import {Head} from '@inertiajs/react';
import {useTranslation} from 'react-i18next';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;
import IdeascaleProfileCard from "@/Pages/IdeascaleProfile/Partials/IdeascaleProfileCard";

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
    ideascaleProfile: IdeascaleProfilesData;
}

const IdeascaleProfile = ({ideascaleProfile}: PageProps<IdeascaleProfilesPageProps>) => {
    const {t} = useTranslation();

    return (
        <>
            <Head title={ideascaleProfile.name} />

            <div className="relative flex w-full flex-col justify-center gap-8">
                <section className="container py-8">
                    <IdeascaleProfileCard ideascaleProfile={ideascaleProfile} />
                </section>

                <section className="container py-8">
                    <h4 className="title-4">{t('comingSoon')}</h4>
                    <div>{JSON.stringify(ideascaleProfile)}</div>
                </section>
            </div>

        </>
    );
};

export default IdeascaleProfile;
