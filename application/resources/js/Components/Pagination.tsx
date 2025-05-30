import { ArrowLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { InertiaLinkProps, Link } from '@inertiajs/react';

// const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => {
//     <nav
//         role="navigation"
//         aria-label="pagination"
//         className={cn('mx-auto flex w-full', className)}
//         {...props}
//     />;
// };
// Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
    HTMLUListElement,
    React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        className={cn('flex w-full flex-row items-center gap-1', className)}
        {...props}
    />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
    HTMLLIElement,
    React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
    isActive?: boolean;
    handleclick?: (update: React.MouseEvent<Element>) => number;
    linkProps: Partial<InertiaLinkProps>
} & React.ComponentProps<'a'> & InertiaLinkProps;

const PaginationLink = ({
    className,
    isActive,
    handleclick,
    linkProps,
    ...props
}: PaginationLinkProps) => (
    <Link
        onClick={handleclick}
        aria-current={isActive ? 'page' : undefined}
        className={cn(className, isActive ? 'text-primary' : '')}
        {...props}
        {...linkProps}
    ></Link>
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
    className,
    linkProps,
    ...props
}: React.ComponentProps<typeof PaginationLink>) => {
    const { t } = useTranslation();
    return (
        <PaginationLink
            aria-label={t('pagination.goPreviousPage')}
            className={cn('flex items-center gap-1', className)}
            linkProps={linkProps}
            {...props}
        >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('pagination.previous')}</span>
        </PaginationLink>
    );
};
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
    className,
    linkProps,
    ...props
}: React.ComponentProps<typeof PaginationLink>) => {
    const { t } = useTranslation();
    return (
        <PaginationLink
            aria-label={t('pagination.goNextPage')}
            className={cn('flex items-center gap-1 pr-2.5', className)}
            linkProps={linkProps}
            {...props}
        >
            <span>{t('pagination.next')}</span>
            <ChevronRight className="h-4 w-4" />
        </PaginationLink>
    );
};
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
    className,
    ...props
}: React.ComponentProps<'span'>) => {
    const { t } = useTranslation();
    return (
        <span
            aria-hidden
            className={cn(
                'flex h-9 w-9 items-center justify-center',
                className,
            )}
            {...props}
        >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{t('pagination.morePages')}</span>
        </span>
    );
};
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
    // Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
};
