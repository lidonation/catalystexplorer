import { ModalLink } from '@inertiaui/modal-react';
import React, { ReactNode } from 'react';

interface ModalNavLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    title?: string;
    ariaLabel?: string;
    active?: string;
    prefetch?: boolean;
    async?: boolean;
    preserveScroll?: string;
    preserveState?: string;
    data?: Record<string, any>;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    replace?: string;
    //These will affect the Modal
    closeButton?: boolean;
    closeExplicitly?: boolean;
    maxWidth?: string;
    paddingClasses?: string;
    panelClasses?: string;
    position?: string;
    dataTestid?: string;
}

const ModalNavLink: React.FC<ModalNavLinkProps> = ({
    href,
    children,
    className = '',
    title,
    ariaLabel,
    active = 'false',
    prefetch = false,
    async = false,
    preserveScroll,
    preserveState,
    data,
    method = 'get',
    replace = 'false',
    closeButton = false,
    closeExplicitly = false,
    maxWidth = '2xl',
    paddingClasses = 'p-4 sm:p-6',
    panelClasses,
    position = 'right',
    dataTestid,
}) => {
    const commonProps = {
        href,
        className,
        title,
        'aria-label': ariaLabel,
        'aria-current': active ? 'page' : undefined,
        prefetch,
        data,
        method,
        replace,
        'data-testid': dataTestid,
    };

    return (
        <ModalLink
            {...commonProps}
            active={active}
            async={async}
            closeButton={closeButton}
            closeExplicitly={closeExplicitly}
            preservescroll={preserveScroll}
            preservestate={preserveState}
            maxWidth={maxWidth}
            paddingClasses={paddingClasses}
            panelClasses={`bg-background-lighter relative mt-16 lg:my-4 min-h-screen rounded-lg ${panelClasses || ''}`}
            position={position}
            prefetch={'false'}
        >
            {({ loading }: { loading: boolean }) =>
                loading ? (
                    <div className="flex items-center justify-center">
                        <div className="border-background-lighter border-t-primary h-5 w-5 animate-spin rounded-full border-2"></div>
                    </div>
                ) : (
                    children
                )
            }
        </ModalLink>
    );
};

export default ModalNavLink;
