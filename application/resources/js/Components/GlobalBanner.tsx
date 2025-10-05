import { useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function GlobalBanner() {
    const { t } = useLaravelReactI18n();
    const [isVisible, setIsVisible] = useState(true);

    // Check if banner was previously dismissed (using localStorage)
    const [isDismissed, setIsDismissed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('ballotSupportBannerDismissed') === 'true';
    });

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        if (typeof window !== 'undefined') {
            localStorage.setItem('ballotSupportBannerDismissed', 'true');
        }
    };

    // Don't render if dismissed or not visible
    if (isDismissed || !isVisible) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm md:text-base text-center font-medium">
                        {t('ballotSupportBanner')}
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors duration-200 flex-shrink-0"
                    aria-label="Close banner"
                >
                    <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}