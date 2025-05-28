import multiavatar from '@multiavatar/multiavatar/esm';
import { useEffect, useMemo, useState } from 'react';

export default function UserAvatar({
    size = 'size-9',
    imageUrl,
    name = 'User',
}: {
    imageUrl?: string;
    size?: string;
    name?: string;
}) {
    const [avatarSrc, setAvatarSrc] = useState('');

    const fallbackSvg = useMemo(() => {
        const svg = multiavatar(name);
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }, [name]);

    useEffect(() => {
        let isMounted = true;

        if (!imageUrl) {
            if (isMounted) setAvatarSrc(fallbackSvg);
            return;
        }

        const img = new Image();
        img.src = imageUrl;

        img.onload = () => {
            if (isMounted) setAvatarSrc(imageUrl);
        };

        img.onerror = () => {
            if (isMounted) setAvatarSrc(fallbackSvg);
        };

        return () => {
            isMounted = false;
        };
    }, [imageUrl, fallbackSvg]);

    return (
        <img
            src={avatarSrc}
            alt={name + ' avatar'}
            className={'rounded-full ' + size}
            aria-label="User avatar"
        />
    );
}
