import catalystLogoDark from '@/assets/images/catalyst-logo-dark.png';
import catalystLogoLight from '@/assets/images/catalyst-logo-light.png';
import { useEffect, useState } from 'react';

type CatalystLogoProps = {
    className?: string;
};

export default function CatalystLogo({ className }: CatalystLogoProps) {
    const [logoSrc, setLogoSrc] = useState(catalystLogoLight);

    const updateLogoBasedOnTheme = (theme: string | null) => {
        if (theme !== 'light') {
            setLogoSrc(catalystLogoLight);
        } else {
            setLogoSrc(catalystLogoDark);
        }
    };

    useEffect(() => {
        const currentTheme =
            document.documentElement.getAttribute('data-theme');
        updateLogoBasedOnTheme(currentTheme);

        const observer = new MutationObserver(() => {
            const newTheme =
                document.documentElement.getAttribute('data-theme');
            updateLogoBasedOnTheme(newTheme);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <img className={className} src={logoSrc} alt="Catalyst Explorer logo" />
    );
}
