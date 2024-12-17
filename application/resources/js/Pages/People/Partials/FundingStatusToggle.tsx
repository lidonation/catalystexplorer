import { useTranslation } from 'react-i18next';

interface FundingStatusToggleProps {
    checked: boolean;
    onChange: () => void;
}

const FundingStatusToggle: React.FC<FundingStatusToggleProps> = ({ checked, onChange }) => {
    const { t } = useTranslation();

    return (
        <div className="relative flex flex-col items-center">
            {/* Left Vertical Border */}
            <div className="absolute left-0 top-0 h-full w-px bg-gray-300"></div>

            <span className="text-sm font-medium mb-2">{t('people.fundingStatus')}</span>

            <label className="relative inline-flex cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-primary transition-colors duration-300">
                    <div
                        className={`w-6 h-6 bg-white rounded-full shadow absolute top-0 transition-transform duration-300 ${
                            checked ? 'translate-x-6' : 'translate-x-0'
                        }`}
                    />
                </div>
            </label>

            {/* Right Vertical Border */}
            <div className="absolute right-0 top-0 h-full w-px bg-gray-300"></div>
        </div>
    );
};

export default FundingStatusToggle;
