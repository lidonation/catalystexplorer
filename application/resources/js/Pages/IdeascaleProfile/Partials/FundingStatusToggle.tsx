import {useLaravelReactI18n} from "laravel-react-i18n";

interface FundingStatusToggleProps {
    checked: boolean;
    onChange: () => void;
}

const FundingStatusToggle: React.FC<FundingStatusToggleProps> = ({ checked, onChange }) => {
    const { t } = useLaravelReactI18n();

    return (
        <div className="relative flex flex-col items-center">
            <div className="bg-background absolute top-0 left-0 h-full w-px"></div>

            <span className="mb-6">
                {t('ideascaleProfiles.fundingStatus')}
            </span>

            <label className="relative inline-flex cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only peer"
                />
                <div className="bg-background peer-checked:bg-primary h-6 w-12 rounded-full border transition-colors duration-300">
                    <div
                        className={`w-6 h-6 bg-white rounded-full shadow absolute top-0 transition-transform duration-300 ${
                            checked ? 'translate-x-6' : 'translate-x-0'
                        }`}
                    />
                </div>
            </label>

            <div className="bg-background absolute top-0 right-0 h-full w-px"></div>
        </div>
    );
};

export default FundingStatusToggle;
