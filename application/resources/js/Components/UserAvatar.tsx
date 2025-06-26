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
        <div className="relative inline-block group">
            <img
                src={avatarSrc}
                alt={name + ' avatar'}
                className={'rounded-full ' + size}
                aria-label="User avatar"
            />
            <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-white text-black text-xs px-2 py-1 rounded border-2 border-black shadow-md whitespace-nowrap">
                    {name}
                </div>
            </div>
        </div>
    );
}