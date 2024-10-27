import catalystLogoDark from '@/assets/images/catalyst-logo-dark.png';
import catalystLogoLight from '@/assets/images/catalyst-logo-light.png';
import { useThemeContext } from '@/Context/ThemeContext';
import { useEffect, useState } from 'react';

type CatalystLogoProps = {
    className?: string;
};

export default function CatalystLogo({ className }: CatalystLogoProps) {
    const [logoSrc, setLogoSrc] = useState(catalystLogoLight);

    const { theme } = useThemeContext();

    const updateLogoBasedOnTheme = (theme: string | null) => {
        if (theme !== 'light') {
            setLogoSrc(catalystLogoLight);
        } else {
            setLogoSrc(catalystLogoDark);
        }
    };

    useEffect(() => {
        updateLogoBasedOnTheme(theme);
    }, [theme]);

    return (
        <img className={className} src={logoSrc} alt="Catalyst Explorer logo" />
    );
}
