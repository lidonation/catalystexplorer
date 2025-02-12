import React, { useState } from "react";
import ProposalSearchBar from "./ProposalSearchBar";
import ProfileSearchBar from "./ProfileSearchBar";
import ProfileCard from "./ProfileCard";
import ClaimProfileForm from "./ClaimProfileForm";
import ProposalList from "./ProposalList";
import ProfileList from "./ProfileList";
import VerificationCard from "./VerificationCard";
import { useTranslation } from 'react-i18next';
import PageHeader from "./PageHeader";
import Title from "@/Components/atoms/Title";

const initialClaimedProfiles: Profile[] = [
    {
        name: "John Doe",
        image: "https://i.pravatar.cc/",
        proposals: 2,
        status: "claimed",
    },
    {
        name: "John Velocity",
        image: "https://i.pravatar.cc/",
        proposals: 2,
        status: "claimed",
    },
    {
        name: "John XL",
        image: "https://i.pravatar.cc/",
        proposals: 2,
        status: "claimed",
    }
];

const initialProposals = [
    {
        profileName: "John Doe",
        title: "Improving Community Engagement.Sustainable Energy Solutions.Sustainable Energy Solutions.Sustainable Energy Solutions.Sustainable Energy Solutions.",
        budget: 5000,
        fund: "Fund 9",
        campaign: "Community Development",
    },
    {
        profileName: "John Doe",
        title: "Sustainable Energy Solutions.Sustainable Energy Solutions.Sustainable Energy Solutions.Sustainable Energy Solutions.",
        budget: 10000,
        fund: "Fund 10",
        campaign: "Environmental Sustainability",
    },

    {
        profileName: "John Velocity",
        title: "Sustainable Energy Solutions.Sustainable Energy Solutions.Sustainable Energy Solutions.Sustainable Energy Solutions.",
        budget: 10000,
        fund: "Fund 10",
        campaign: "Environmental Sustainability",
    },

    {
        profileName: "John XL",
        title: "Sustainable Energy Solutions.Sustainable Energy Solutions.Sustainable Energy Solutions.Sustainable Energy Solutions.",
        budget: 10000,
        fund: "Fund 10",
        campaign: "Environmental Sustainability",
    },

    {
        profileName: "John XL",
        title: "Sustainable Energy Solutions.Sustainable Energy Solutions.Sustainable Energy Solutions.Sustainable Energy Solutions.",
        budget: 10000,
        fund: "Fund 10",
        campaign: "Environmental Sustainability",
    },
];

const initialAllProfiles = [
    {
        name: "Alice Hopper",
        image: "https://i.pravatar.cc/",
        proposals: 3,
        status: "available",
    },
    {
        name: "Lingi Kopper",
        image: "https://i.pravatar.cc/",
        proposals: 3,
        status: "unavailable",
    },
    {
        name: "Alice Gopper",
        image: "https://i.pravatar.cc/",
        proposals: 3,
        status: "available",
    },
];
interface Profile {
    name: string;
    image: string;
    proposals: number;
    status: string;
}

interface Proposal {
    profileName: string;
    title: string;
    budget: number;
    fund: string;
    campaign: string;
}

interface ClaimProfileFormProps {
    profile: Profile;
    onClaim: (profile: Profile) => void;
}

interface ProfileListProps {
    profiles: Profile[];
    onSelectProfile: (name: string) => void;
    selectedProfile: string | null;
}

interface ProfileWorkflowProps {
    user: { name: string };
}
const ProfileWorkflow: React.FC<ProfileWorkflowProps> = ({ user }) => {
    const { t } = useTranslation();

    const [showClaimProfile, setShowClaimProfile] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile | any>(null); // Use Profile object, not just string
    const [claimedProfiles, setClaimedProfiles] = useState(initialClaimedProfiles);
    const [allProfiles, setAllProfiles] = useState(initialAllProfiles);
    const [formProfile, setFormProfile] = useState<string | null>(null);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    const handleClaimProfile = (profile: Profile) => {
        setClaimedProfiles([...claimedProfiles, profile]);
        setAllProfiles(allProfiles.map(p => p.name === profile.name ? { ...p, status: "claimed" } : p));
        setFormProfile(null);
        setShowClaimProfile(false);
        setVerificationCode('8vklg'); //TODO: Dynamically set verification code
        setShowVerification(true);
    };

    const handleProfileClick = (profile: Profile) => {
        if (profile.status !== "available") return;
        setFormProfile(formProfile === profile.name ? null : profile.name);
    };

    const handleBackFromVerification = () => {
        setShowVerification(false);
    };

    const getSectionTitle = () => {
        if (showVerification) return "";
        if (!selectedProfile && !showClaimProfile) return t('profileWorkflow.sectionTitle.start');
        if (selectedProfile) return t('profileWorkflow.sectionTitle.selectProposal');
        if (showClaimProfile) return t('profileWorkflow.sectionTitle.claimProfile');
        return "";
    };

    return (
        <div className="w-full max-w-lg p-6 mx-auto shadow-md bg-background rounded-2xl">

            {!showVerification && <PageHeader userName={user.name} sectionTitle={getSectionTitle()} />}

            <div className="w-full">
                {showVerification ? (
                    <VerificationCard
                        verificationCode={verificationCode}
                        onBack={handleBackFromVerification}
                    />
                ) : !selectedProfile && !showClaimProfile ? (
                    <>
                        <Title level="3" className="font-semibold">{t('profileWorkflow.myProfiles')}</Title>
                        <div className="my-2 border-t border-gray-300"></div>
                        <ProfileList
                            profiles={claimedProfiles}
                            onSelectProfile={(profileName) => {
                                const profile = claimedProfiles.find(p => p.name === profileName) || null;
                                setSelectedProfile(profile);
                            }}
                            selectedProfile={selectedProfile ? (selectedProfile as Profile).name : null}
                        />
                        <div className="my-2 border-t border-gray-300"></div>

                        <div className="mt-5 text-center">
                            <button
                                className="text-sm font-medium border-b border-current border-dotted cursor-pointer text-primary"
                                onClick={() => setShowClaimProfile(true)}
                            >
                                {t('completedProjectNfts.claimProfile')}
                            </button>
                        </div>
                    </>
                ) : showClaimProfile ? (
                    <>
                        <button
                            className="flex items-center mt-4 text-sm font-medium cursor-pointer text-primary"
                            onClick={() => setShowClaimProfile(false)}
                        >
                            &larr; {t('profileWorkflow.back')}
                        </button>

                        <ProfileSearchBar />

                        <div className="mt-4 space-y-2">
                            {allProfiles
                                .filter((profile) => profile.status !== "claimed")
                                .map((profile, index) => (
                                    <div key={index} className="w-full sm:max-w-[400px] lg:max-w-[500px]">
                                        <ProfileCard
                                            profile={profile}
                                            onSelect={() => handleProfileClick(profile)}
                                            isSelected={formProfile === profile.name}
                                            showStatusBadge={true}
                                        />
                                        {formProfile === profile.name && (
                                            <ClaimProfileForm
                                                profile={profile}
                                                onClaim={handleClaimProfile}
                                            />
                                        )}
                                    </div>
                                ))}
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            className="flex items-center mt-4 text-sm font-medium cursor-pointer text-primary"
                            onClick={() => setSelectedProfile(null)}
                        >
                            &larr; {t('profileWorkflow.back')}
                        </button>
                        <div className="w-full mt-2 card-container">
                            <ProposalSearchBar
                                autoFocus={true}
                                showRingOnFocus={true}
                                handleSearch={(query) => console.log(query)}
                                focusState={(isFocused) => console.log(isFocused)}
                            />
                        </div>

                        <p className="mt-2">
                            {t('profileWorkflow.selectProposal')}
                            <span className="inline-block px-1 m-1 text-xs border border-gray-200 rounded">
                                2/3
                            </span>
                        </p>

                        <ProposalList
                            proposals={[]}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileWorkflow;
