import ProfileCard from "./ProfileCard";
import { useTranslation } from "react-i18next";
import Paragraph from "@/Components/atoms/Paragraph";

interface Profile {
    name: string;
    image: string;
    proposals: number;
    status: string; // "available" or "unavailable"
}

interface ProfileListProps {
    profiles: Profile[];
    onSelectProfile: (name: string) => void;
    selectedProfile: any;
}

const ProfileList: React.FC<ProfileListProps> = ({ profiles, onSelectProfile, selectedProfile }) => {
    const { t } = useTranslation();

    if (!Array.isArray(profiles) || profiles.length === 0) {
        return (
            <div className="p-4 text-center text-red-600 border border-gray-200 rounded-lg">
                <Paragraph>{t("profileWorkflow.noProfilesAvailable")}</Paragraph>
            </div>
        );
    }

    return (
        <div className="mt-2 space-y-2">
            {profiles.map((profile, index) => (
                <div key={index} className="w-full sm:max-w-[400px] lg:max-w-[500px]">
                    <ProfileCard
                        profile={profile}
                        onSelect={() => onSelectProfile(profile.name)}
                        isSelected={selectedProfile === profile.name}
                        showStatusBadge={profile.status === "available"}
                    />
                </div>
            ))}
        </div>
    );
};

export default ProfileList;
