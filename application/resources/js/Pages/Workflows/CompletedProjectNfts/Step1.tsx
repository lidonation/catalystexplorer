import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import ProfileList from '@/Pages/CompletedProjectNfts/Partials/ProfileList';
import { StepDetails } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

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

    const preveStep = () => {
        if (activeStep == 1) {
            return '';
        } else {
            return useLocalizedRoute('workflows.completedProjectsNfts', {
                step: activeStep - 1,
            });
        }
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep].info ?? ''}>
            <Nav stepDetails={stepDetails} />

            <Content>
                <div className="bg-background mx-auto w-full rounded-2xl p-6">
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

            <Footer>
                <PrimaryLink
                    href={preveStep()}
                    className="px-8 py-3 text-sm"
                    disabled={activeStep == 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryLink
                    href={preveStep()}
                    className="px-8 py-3 text-sm"
                    disabled={!!selectedProfiles.length}
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step1;
