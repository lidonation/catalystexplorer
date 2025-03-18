import Title from '@/Components/atoms/Title';
import ProfileList from '@/Pages/CompletedProjectNfts/Partials/ProfileList';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import WorkflowLayout from '../WorkflowLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import Nav from '../Partials/WorkflowNav';
import { StepDetails } from '@/types';
import Content from '../Partials/WorkflowContent';

interface Step1Props {
    profiles: IdeascaleProfileData[];
    stepDetails: StepDetails[];
    activeStep: number;
}

const Step1: React.FC<Step1Props> = ({ profiles, stepDetails, activeStep }) => {
    const { t } = useTranslation();

    let selectedProfiles: string[] = [];

    const handleProfileSelect = (hash: string) => {
        if (selectedProfiles.includes(hash)) {
            selectedProfiles = selectedProfiles.filter(
                (profilehash) => profilehash != hash,
            );
        } else {
            selectedProfiles.push(hash);
        }
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep].info??''}>
            
            <Nav stepDetails={stepDetails} />

            <Content>
                <div className="bg-background mx-auto w-full max-w-lg rounded-2xl p-6 shadow-md">
                    <div className="w-full">
                        <>
                            <Title level="3" className="font-semibold">
                                {t('profileWorkflow.myProfiles')}
                            </Title>
                            <div className="my-2 border-t border-gray-300"></div>
                            <ProfileList
                                profiles={profiles || []}
                                onProfileClick={() => handleProfileSelect}
                            />
                            <div className="my-2 border-t border-gray-300"></div>
                            <div className="mt-5 text-center">
                                <Link
                                    className="text-primary cursor-pointer border-b border-dotted border-current text-sm font-medium"
                                    href={useLocalizedRoute(
                                        'workflows.claimIdeascaleProfile.index',
                                        { step: 1 },
                                    )}
                                    target="_blank"
                                >
                                    {!profiles || profiles?.length === 0
                                        ? t('completedProjectNfts.claimProfile')
                                        : t(
                                              'completedProjectNfts.claimAnotherProfile',
                                          )}
                                </Link>
                            </div>
                        </>
                    </div>
                </div>
            </Content>
        </WorkflowLayout>
    );
};

export default Step1;
