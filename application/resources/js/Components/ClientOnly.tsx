import { useEffect, useState } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * ClientOnly component prevents server-side rendering of its children.
 * This is useful for components that depend on browser-specific APIs
 * or cause hydration mismatches.
 */
const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default ClientOnly;
