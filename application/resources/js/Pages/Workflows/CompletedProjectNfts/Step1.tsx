import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import ProfileList from '@/Pages/CompletedProjectNfts/Partials/ProfileList';
import { StepDetails } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
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
    const { t } = useLaravelReactI18n();
    const [selectedProfiles, setSelectedProfile] = useState<string[]>([]);

    const handleProfileSelect = (hash: string | null) => {
        if (hash && selectedProfiles.includes(hash)) {
            const updatedProfiles = selectedProfiles.filter(
                (profilehash) => profilehash != hash,
            );
            setSelectedProfile(updatedProfiles);
        } else if (hash) {
            const updatedProfiles = [...selectedProfiles, hash];
            setSelectedProfile(updatedProfiles);
        }
    };

    const localizedRoute = useLocalizedRoute;

    const prevStep =
        activeStep == 1
            ? ''
            : localizedRoute('workflows.completedProjectsNfts', {
                  step: activeStep - 1,
              });

    const nextStep = localizedRoute('workflows.completedProjectsNft.index', {
        step: activeStep + 1,
        profiles: selectedProfiles,
    });

    return (
        <WorkflowLayout
            title="Completed Projects Nfts"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background mx-auto w-full rounded-2xl p-4 lg:p-6">
                    <div className="w-full">
                        <>
                            <Title level="3" className="font-semibold">
                                {t('profileWorkflow.myProfiles')}
                            </Title>
                            <div className="my-2 border-t border-gray-300"></div>
                            <ProfileList
                                profiles={profiles || []}
                                onProfileClick={(hash) =>
                                    handleProfileSelect(hash)
                                }
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
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={activeStep == 1}
                    onClick={(e) => activeStep == 1 && e.preventDefault()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryLink
                    href={!selectedProfiles.length ? '' : nextStep}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={!selectedProfiles.length}
                    onClick={(e) =>
                        !selectedProfiles.length && e.preventDefault()
                    }
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step1;
