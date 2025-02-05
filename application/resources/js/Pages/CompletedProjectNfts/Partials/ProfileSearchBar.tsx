import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProfileSearchBar = () => {
    const { t } = useTranslation();

    return (
        <div className="relative mt-4">
            <Search className="absolute flex items-center justify-center w-6 h-6 text-gray-400 transform -translate-y-1/2 left-2 top-1/2 " />
            <input
                type="text"
                placeholder={t("profileWorkflow.findCatalystUser")}
                className="w-full pl-10 border rounded-lg shadow-none border-darker bg-background text-content focus:border-primary focus:ring-2 focus:ring-primary focus:ring-0"
            />
        </div>
    );
};

export default ProfileSearchBar;
