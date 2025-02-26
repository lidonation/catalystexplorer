import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import ClaimProfileForm from './ClaimProfileForm';
import PageHeader from './PageHeader';
import ProfileCard from './ProfileCard';
import ProfileList from './ProfileList';
import ProfileSearchBar from './ProfileSearchBar';
import ProposalList from './ProposalList';
import ProposalSearchBar from './ProposalSearchBar';
import VerificationCard from './VerificationCard';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProfileWorkflowProps {
    user: { name: string };
    proposals: PaginatedData<ProposalData[]>;
    profiles: PaginatedData<IdeascaleProfileData[]>;
}
const ProfileWorkflow: React.FC<ProfileWorkflowProps> = ({
    user,
    profiles,
    proposals,
}) => {
    const { t } = useTranslation();

    const [showClaimProfile, setShowClaimProfile] = useState(false);
    const [profileSearchResults, setProfileSearchResults] = useState<
        IdeascaleProfileData[]
    >([]);
    const [showVerification, setShowVerification] = useState(false);
    const [viewProposal, setViewProposal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [claimProfile, setClaimProfile] =
        useState<IdeascaleProfileData | null>(null);
    const [selectedProfile, setSelectedProfile] =
        useState<IdeascaleProfileData | null>(null);
    const { getFilter, setFilters, filters } = useFilterContext();
    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    const handleSearchProfiles = async (searchQuery = '', perPage = 6) => {
        try {
            const response = await axios.get(
                route('api.ideascaleProfiles.index'),
                {
                    params: {
                        search: searchQuery,
                        per_page: perPage,
                    },
                },
            );

            setProfileSearchResults(response?.data?.data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        }
    };

    const handleSearchProposals = (search: string) => {
        setFilters({
            param: ParamsEnum.QUERY,
            value: search,
            label: 'Search',
        });
        setSearchQuery(search);
        const url = new URL(window.location.href);

        if (search.trim() === '') {
            url.searchParams.delete(ParamsEnum.QUERY);
            router.get(
                window.location.pathname,
                {},
                { replace: true, preserveScroll: true, preserveState: true },
            );
        } else {
            setFilters({
                param: ParamsEnum.QUERY,
                value: search,
                label: 'Search',
            });
            url.searchParams.set(ParamsEnum.QUERY, search);
        }

        window.history.replaceState(null, '', url.toString());
    };

    const handleToggleClaimForm = (profile: IdeascaleProfileData) => {
        if (profile?.claimed_by !== undefined && profile.claimed_by !== null)
            return;

        setClaimProfile((prev) => {
            return prev?.hash === profile?.hash ? null : profile;
        });
    };

    const handleBackFromVerification = () => {
        setShowVerification(false);
    };

    const handleProfileSelect = () => {
        setViewProposal(true);
    };

    const getSectionTitle = () => {
        if (showVerification) return '';

        if (viewProposal && !showClaimProfile)
            return t('profileWorkflow.sectionTitle.selectProposal');

        if (showClaimProfile && !viewProposal)
            return t('profileWorkflow.sectionTitle.claimProfile');

        if (!selectedProfile && !showClaimProfile)
            return t('profileWorkflow.sectionTitle.start');

        return '';
    };

    const totalProposalsViewed = proposals.per_page * proposals.current_page;

    return (
        <div className="bg-background mx-auto w-full max-w-lg rounded-2xl p-6 shadow-md">
            {!showVerification && (
                <PageHeader
                    userName={user.name}
                    sectionTitle={getSectionTitle()}
                />
            )}

            <div className="w-full">
                {viewProposal ? (
                    <>
                        <button
                            className="text-primary mt-4 flex cursor-pointer items-center text-sm font-medium"
                            onClick={() => {
                                setViewProposal(false);
                                setSelectedProfile(null);
                            }}
                        >
                            {`< ${t('profileWorkflow.back')}`}
                        </button>
                        <div className="card-container mt-2 w-full">
                            <ProposalSearchBar
                                autoFocus={true}
                                showRingOnFocus={true}
                                handleSearch={(query) =>
                                    handleSearchProposals(query)
                                }
                                focusState={(isFocused) =>
                                    console.log(isFocused)
                                }
                            />
                        </div>

                        <Paragraph className="mt-2">
                            {t('profileWorkflow.selectProposal')}
                            <span className="m-1 inline-block rounded border border-gray-200 px-1 text-xs">
                                {`${totalProposalsViewed > proposals?.total ? proposals?.total : totalProposalsViewed}/${proposals.total}`}
                            </span>
                        </Paragraph>

                        <ProposalList proposals={proposals || []} />
                    </>
                ) : showVerification ? (
                    <VerificationCard
                        verificationCode={verificationCode}
                        onBack={handleBackFromVerification}
                    />
                ) : showClaimProfile ? (
                    <>
                        <button
                            className="text-primary mt-4 mb-4 flex cursor-pointer items-center text-sm font-medium"
                            onClick={() => setShowClaimProfile(false)}
                        >
                            {`< ${t('profileWorkflow.back')}`}
                        </button>

                        <ProfileSearchBar
                            autoFocus={true}
                            showRingOnFocus={true}
                            handleSearch={(query) =>
                                handleSearchProfiles(query)
                            }
                        />

                        <div className="mt-4 space-y-2">
                            {profileSearchResults.map((profile, index) => (
                                <div
                                    key={index}
                                    className={`w-full sm:max-w-[400px] lg:max-w-[500px]`}
                                >
                                    <ProfileCard
                                        profile={profile}
                                        onSelect={() => {
                                            setViewProposal(false);
                                            handleToggleClaimForm(profile);
                                        }}
                                        className={
                                            profile?.claimed_by
                                                ? 'cursor-not-allowed'
                                                : 'cursor-pointer'
                                        }
                                    >
                                        <div className="ml-6 flex-shrink-0">
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm ${
                                                    !profile?.claimed_by
                                                        ? 'cursor-pointer bg-green-100 text-green-600'
                                                        : 'cursor-not-allowed bg-red-100 text-red-600'
                                                }`}
                                            >
                                                {!profile?.claimed_by
                                                    ? t(
                                                          'profileWorkflow.claimProfile',
                                                      )
                                                    : t(
                                                          'profileWorkflow.unavailable',
                                                      )}
                                            </span>
                                        </div>
                                    </ProfileCard>

                                    {claimProfile?.hash === profile.hash &&
                                        profile.hash && (
                                            <ClaimProfileForm
                                                profile={profile}
                                                onVerificationCodeUpdate={
                                                    setVerificationCode
                                                }
                                                onShowVerification={
                                                    setShowVerification
                                                }
                                            />
                                        )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <Title level="3" className="font-semibold">
                            {t('profileWorkflow.myProfiles')}
                        </Title>
                        <div className="my-2 border-t border-gray-300"></div>
                        <ProfileList
                            profiles={profiles.data || []}
                            onProfileClick={handleProfileSelect}
                        />
                        <div className="my-2 border-t border-gray-300"></div>

                        <div className="mt-5 text-center">
                            <button
                                className="text-primary cursor-pointer border-b border-dotted border-current text-sm font-medium"
                                onClick={() => setShowClaimProfile(true)}
                            >
                                {!profiles?.data || profiles?.data?.length === 0
                                    ? t('completedProjectNfts.claimProfile')
                                    : t(
                                          'completedProjectNfts.claimAnotherProfile',
                                      )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileWorkflow;
