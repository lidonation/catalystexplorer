import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import ProfileCard from '@/Pages/CompletedProjectNfts/Partials/ProfileCard';
import ProfileSearchBar from '@/Pages/CompletedProjectNfts/Partials/ProfileSearchBar';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { router, usePage } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import lodashPkg from 'lodash';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useState } from 'react';
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
    const { debounce } = lodashPkg;
    const { auth } = usePage().props;
    const [search, setSearch] = useState<string>('');
    const { locale } = usePage().props;
    const [selectedProfile, setSelectedProfile] = useState<string>('');

    const handleSearchProfiles = useCallback(
        debounce((searchTerm: string) => {
            setSearch(searchTerm);
            const searchRoute = generateLocalizedRoute(
                'workflows.claimIdeascaleProfile.index',
                {
                    step: activeStep,
                    search: searchTerm,
                    profiles,
                },
                locale as string | undefined,
            );

            router.visit(searchRoute, {
                only: ['profiles'],
                preserveState: true,
            });
        }, 500),
        [activeStep, profiles, locale],
    );

    const localizedRoute = useLocalizedRoute;
    const prevStep =
        activeStep === 1
            ? ''
            : localizedRoute('workflows.claimIdeascaleProfile.index', {
                  step: activeStep - 1,
              });

    const nextStep = selectedProfile
        ? localizedRoute('workflows.claimIdeascaleProfile.index', {
              step: activeStep + 1,
              profile: selectedProfile,
          })
        : '';

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background sticky mb-4 w-full px-4 pt-4 lg:top-0 lg:px-8">
                    <ProfileSearchBar
                        autoFocus={true}
                        showRingOnFocus={true}
                        handleSearch={(query) => handleSearchProfiles(query)}
                    />
                </div>
                <div className="px-4 lg:px-8">
                    <div className="mt-4 max-h-[30rem] w-full space-y-2 overflow-y-auto">
                        {!!profiles.length &&
                            profiles.map((profile, index) => (
                                <div key={index} className={`w-full`}>
                                    <div className="w-full" key={index}>
                                        <input
                                            type="radio"
                                            id={
                                                profile.hash as
                                                    | string
                                                    | undefined
                                            }
                                            name="hosting"
                                            value="hosting-small"
                                            className="peer hidden"
                                            required
                                            onChange={() =>
                                                profile.hash &&
                                                setSelectedProfile(profile.hash)
                                            }
                                        />
                                        <label
                                            htmlFor={
                                                profile.hash as
                                                    | string
                                                    | undefined
                                            }
                                            className="peer-checked:border-primary peer-checked:text-primary peer-checked:border-primary inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-100 text-gray-500 peer-checked:border-2"
                                        >
                                            <ProfileCard
                                                profile={profile}
                                                className={
                                                    profile?.claimed_by_id
                                                        ? 'cursor-not-allowed'
                                                        : 'cursor-pointer'
                                                }
                                            >
                                                <div className="ml-6 flex-shrink-0">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-sm ${
                                                            !profile?.claimed_by_id
                                                                ? 'cursor-pointer bg-green-100 text-green-600'
                                                                : 'cursor-not-allowed bg-red-100 text-red-600'
                                                        }`}
                                                    >
                                                        {!profile?.claimed_by_id
                                                            ? t(
                                                                  'profileWorkflow.claimProfile',
                                                              )
                                                            : t(
                                                                  'profileWorkflow.unavailable',
                                                              )}
                                                    </span>
                                                </div>
                                            </ProfileCard>
                                        </label>
                                    </div>
                                </div>
                            ))}

                        {search && !profiles?.length && (
                            <div className="text-dark m-4 rounded-lg border border-gray-200 p-4 text-center lg:mt-8 lg:p-4">
                                <Paragraph>
                                    {t('profileWorkflow.noProposalsAvailable')}
                                </Paragraph>
                            </div>
                        )}
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
                    href={!selectedProfile.length ? '' : nextStep}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={!selectedProfile.length}
                    onClick={(e) =>
                        !selectedProfile.length && e.preventDefault()
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
