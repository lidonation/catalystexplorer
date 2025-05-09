import React, { ReactNode, useState } from 'react';
// @ts-ignore
import { ModalLink } from '@inertiaui/modal-react';

interface ModalNavLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    title?: string;
    ariaLabel?: string;
    active?: boolean;
    prefetch?: boolean;
    async?: boolean;
    preserveScroll?: boolean;
    preserveState?: boolean;
    only?: string[];
    data?: Record<string, any>;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    replace?: boolean;
    onFinish?: () => void;
    onCancel?: () => void;
    //These will affect the Modal
    closeButton?: boolean;
    closeExplicitly?: boolean;
    maxWidth?: string;
    paddingClasses?: string;
    panelClasses?: string;
    position?: string;
}

const ModalNavLink: React.FC<ModalNavLinkProps> = ({
    href,
    children,
    className = '',
    title,
    ariaLabel,
    active = false,
    prefetch = false,
    async = false,
    preserveScroll = false,
    preserveState = false,
    only,
    data,
    method = 'get',
    replace = false,
    onFinish,
    onCancel,
    closeButton = false,
    closeExplicitly = false,
    maxWidth = "2xl",
    paddingClasses = "p-4 sm:p-6",
    panelClasses,
    position = "right",
}) => {
    const commonProps = {
        href,
        className,
        title,
        'aria-label': ariaLabel,
        'aria-current': active ? 'page' : undefined,
        prefetch,
        preserveScroll,
        preserveState,
        only,
        data,
        method,
        replace,
        onFinish,
        onCancel,
    };

    return (
        <ModalLink
            {...commonProps}
            active={active}
            async={async}
            closeButton={closeButton}
            closeExplicitly={closeExplicitly}
            maxWidth={maxWidth}
            paddingClasses={paddingClasses}
            panelClasses = {`bg-background relative mt-16 lg:my-4 min-h-screen rounded-lg ${panelClasses || ""}`}
            position={position}
            showProgress={true}
        >
            {({ loading }: { loading: boolean }) => (
                loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-background-lighter border-t-primary"></div>
                    </div>
                ) : children
            )}
        </ModalLink>
    );
};

export default ModalNavLink;