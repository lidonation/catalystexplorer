import catalystLogoDark from '@/assets/images/catalyst-logo-dark.png';
import catalystLogoLight from '@/assets/images/catalyst-logo-light.png';
import { useThemeContext } from '@/Context/ThemeContext';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import { CatalystDarkLogo } from '../svgs/CatalystDarkLogo';
import { CatalystLightLogo } from '../svgs/CatalystLightLogo';
import { CatalystWhiteLogo } from '../svgs/CatalystWhiteLogo';

type CatalystLogoProps = {
    className?: string;
    white?: boolean;
};

export default function CatalystLogo({ className, white }: CatalystLogoProps) {
    const [logoSrc, setLogoSrc] = useState(catalystLogoLight);
    const { theme } = useThemeContext();
    const { t } = useLaravelReactI18n();

    const updateLogoBasedOnTheme = (theme: string | null) => {
        if (theme === 'dark') {
            setLogoSrc(catalystLogoLight);
        } else {
            setLogoSrc(catalystLogoDark);
        }
    };

    useEffect(() => {
        updateLogoBasedOnTheme(theme);
    }, [theme]);

    if (theme === 'dark') {
        return <CatalystDarkLogo />;
    } else if (white) {
        return <CatalystWhiteLogo />;
    } else {
        return <CatalystLightLogo />;
    }
}
