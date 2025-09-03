import {
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/Pagination';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { cn } from '@/lib/utils';
import { InertiaLinkProps, Link } from '@inertiajs/react';
import React from 'react';
import { PaginatedData } from '../types/paginated-data';

type PaginationComponentProps<T> = {
    pagination: PaginatedData<T>;
    linkProps?: Partial<InertiaLinkProps>;
};

const PaginationComponent: React.FC<PaginationComponentProps<any>> = ({
    pagination,
    linkProps = {} as InertiaLinkProps,
}) => {
    const { setFilters, getFilters } = useFilterContext();

    const setPagination = (param: string, value: number, label: string) => {
        setFilters({ param, value, label });
    };

    const buildUrl = (param: string, value: number, label: string) => {
        return getFilters({ param, value, label });
    };

    const {
        current_page,
        links,
        prev_page_url,
        next_page_url,
        from,
        to,
        total,
    } = pagination;

    const pageLinks =
        links?.filter(
            (link) =>
                !link.label.includes('&laquo;') &&
                !link.label.includes('&raquo;') &&
                link.label !== 'Previous' &&
                link.label !== 'Next',
        ) || [];

    const getMobilePageLinks = () => {
        if (pageLinks.length <= 7) return pageLinks;

        const currentIdx = pageLinks.findIndex((link) => link.active);
        const start = Math.max(0, currentIdx - 2);
        const end = Math.min(pageLinks.length, currentIdx + 3);

        let result = [];

        if (start > 0) {
            result.push(pageLinks[0]);
            if (start > 1) {
                result.push({ label: '...', active: false, url: null });
            }
        }
        result = result.concat(pageLinks.slice(start, end));

        if (end < pageLinks.length) {
            if (end < pageLinks.length - 1) {
                result.push({ label: '...', active: false, url: null });
            }
            result.push(pageLinks[pageLinks.length - 1]);
        }

        return result;
    };

    const mobilePageLinks = getMobilePageLinks();
    const renderPageLink = (
        link: any,
        index: number,
        size: 'sm' | 'md' = 'md',
    ) => (
        <PaginationItem key={index}>
            {link.label === '...' ? (
                <PaginationEllipsis />
            ) : (
                <Link
                    href={buildUrl(ParamsEnum.PAGE, link.label, 'Current Page')}
                    onClick={(e) => {
                        e.preventDefault();
                        setPagination(
                            ParamsEnum.PAGE,
                            link.label,
                            'Current Page',
                        );
                    }}
                    aria-current={link.active ? 'page' : undefined}
                    className={cn(
                        'flex items-center justify-center rounded-full',
                        size === 'sm'
                            ? 'size-7 text-xs'
                            : size === 'md'
                              ? 'size-8 text-sm'
                              : 'size-8 text-base',
                        link.active
                            ? 'bg-gray-200 font-semibold'
                            : 'hover:bg-gray-100',
                    )}
                    {...linkProps}
                    data-testid={`pagination-link-${link.label}`}
                >
                    {link.label}
                </Link>
            )}
        </PaginationItem>
    );

    const previousButton = (className = '') => (
        <PaginationItem className="flex-shrink-0 list-none">
            <PaginationPrevious
                linkProps={linkProps}
                href={
                    prev_page_url
                        ? buildUrl(
                              ParamsEnum.PAGE,
                              current_page - 1,
                              'Current Page',
                          )
                        : ''
                }
                className={cn(
                    className,
                    !prev_page_url ? 'pointer-events-none opacity-50' : '',
                )}
            />
        </PaginationItem>
    );

    const nextButton = (className = '') => (
        <PaginationItem className="flex-shrink-0 list-none">
            <PaginationNext
                linkProps={linkProps}
                href={
                    next_page_url
                        ? buildUrl(
                              ParamsEnum.PAGE,
                              current_page + 1,
                              'Current Page',
                          )
                        : ''
                }
                className={cn(
                    className,
                    !next_page_url ? 'pointer-events-none opacity-50' : '',
                )}
            />
        </PaginationItem>
    );

    return (
        <div
            className="flex items-center justify-center py-4"
            data-testid="pagination-component"
        >
            <div className="flex w-full items-center justify-between gap-1 md:hidden">
                {previousButton('px-2 py-1 text-xs')}

                <div className="flex min-w-0 flex-1 justify-center">
                    <ul className="flex list-none items-center gap-1">
                        {mobilePageLinks.map((link, index) =>
                            renderPageLink(link, index, 'sm'),
                        )}
                    </ul>
                </div>

                {nextButton('px-2 py-1 text-xs')}
            </div>
            <div className="hidden w-full items-center justify-between md:flex lg:hidden">
                {previousButton()}

                <div className="flex items-center gap-4">
                    <ul className="flex list-none items-center gap-1">
                        {mobilePageLinks.map((link, index) =>
                            renderPageLink(link, index, 'md'),
                        )}
                    </ul>

                    <div className="text-sm" data-testid="pagination-info">
                        {from}-{to} of{' '}
                        <span className="font-bold">{total}</span>
                    </div>
                </div>

                {nextButton()}
            </div>
            <div className="hidden w-full items-center justify-between lg:flex">
                <div className="flex-shrink-0">{previousButton()}</div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-1">
                        <ul className="flex list-none items-center gap-1">
                            {pageLinks.map((link, index) =>
                                renderPageLink(link, index, 'md'),
                            )}
                        </ul>
                    </div>
                    <div className="text-sm" data-testid="pagination-info">
                        Showing {from} - {to} of{' '}
                        <span className="font-bold">{total}</span>
                    </div>
                </div>

                <div className="flex-shrink-0">{nextButton()}</div>
            </div>
        </div>
    );
};

export default PaginationComponent;
