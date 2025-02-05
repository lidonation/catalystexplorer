import React from "react";
import { EllipsisVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProfileCardProps {
    profile: {
        image: string;
        name: string;
        proposals: number;
        status: string;
    };
    onSelect: () => void;
    isSelected: boolean;
    showStatusBadge: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = React.memo(({ profile, onSelect, isSelected, showStatusBadge }) => {
    const { t } = useTranslation();

    return (
        <div
            className="flex items-center justify-between w-full p-1 transition cursor-pointer hover:bg-darker"
            onClick={onSelect}
        >
            <div className="flex items-center flex-1 space-x-3">
                <div className="flex items-center justify-center w-12 h-12 overflow-hidden rounded-full bg-gradient-to-r from-gray-100 to-gray-900">
                    <img src={profile.image} alt={profile.name} className="object-cover w-full h-full rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{profile.name}</p>
                    <p className="text-sm text-dark">
                        {t("profileWorkflow.proposalsCount", { count: profile.proposals })}
                    </p>
                </div>
            </div>

            <div className="flex-shrink-0 ml-6">
                {showStatusBadge ? (
                    <span
                        className={`px-3 py-1 text-sm rounded-full ${profile.status === "available"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                            }`}
                    >
                        {profile.status === "available"
                            ? t("profileWorkflow.claimProfile")
                            : t("profileWorkflow.unavailable")}
                    </span>
                ) : (
                    !isSelected && (
                        <EllipsisVertical className="w-4 h-4 cursor-pointer text-dark" onClick={onSelect} />
                    )
                )}
            </div>
        </div>
    );
});

export default ProfileCard;
