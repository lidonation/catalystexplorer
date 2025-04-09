import {
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/Pagination';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useFilterContext } from '@/Context/FiltersContext';
import React from 'react';
import { PaginatedData } from '../../types/paginated-data';
import { InertiaLinkProps, Link, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type PaginationComponentProps<T> = {
    pagination: PaginatedData<T>;
    linkProps?: Partial<InertiaLinkProps>;
};

const PaginationComponent: React.FC<PaginationComponentProps<any>> = ({
    pagination,
    linkProps = {} as InertiaLinkProps
}) => {
    const { setFilters, getFilters } = useFilterContext();

    const setPagination = (param: string, value: number, label: string) => {
        setFilters({ param, value, label });
    };

    const buildUrl = (param: string, value: number, label: string) => {
        return getFilters({param, value, label});
    };
    
    const isVoterHistoryPage = () => {
        return window.location.pathname.includes('/votes');
    };

    const handleNavigate = (e: React.MouseEvent, pageNumber: number) => {
        if (isVoterHistoryPage()) {
            e.preventDefault();
            
            const url = new URL(window.location.href);
            const params: Record<string, any> = {};
            
            for (const [key, value] of url.searchParams.entries()) {
                if (value) params[key] = value;
            }
            
            params[ParamsEnum.PAGE] = pageNumber;
            
            router.get(window.location.pathname, params, {
                preserveScroll: true,
                preserveState: true,
                only: ['voterHistories', 'filters'],
                replace: false
            });
            
            return false;
        }
        
        return true;
    };

    let {
        current_page,
        per_page,
        links,
        prev_page_url,
        next_page_url,
        from,
        to,
        total
    } = pagination;


    return (
        <div className="mb-8">
            <div className="flex w-full flex-col gap-2">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    {/* Previous Button */}
                    <div>
                        <PaginationItem className="list-none text-xs">
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
                                className={
                                    !prev_page_url
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }
                                onClick={(e) => {
                                    if (prev_page_url && !handleNavigate(e, current_page - 1)) {
                                        return false;
                                    }
                                }}
                            ></PaginationPrevious>
                        </PaginationItem>
                    </div>
                    <div className="flex flex-col items-center gap-3 md:flex-row">
                        {/* Page Numbers */}
                        <div className="flex flex-col justify-center gap-1">
                            <ul className="flex list-none flex-wrap items-center gap-1 text-sm lg:flex-nowrap lg:gap-4 lg:text-base">
                                {links &&
                                    links.map((link, index) =>
                                        link.label.includes('&laquo;') ||
                                        link.label.includes(
                                            '&raquo;',
                                        ) ? null : (
                                            <PaginationItem
                                                key={index}
                                                className=""
                                            >
                                                {link.label === '...' ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <Link
                                                        href={buildUrl(
                                                            ParamsEnum.PAGE,
                                                            link.label,
                                                            'Current Page',
                                                        )}
                                                        aria-current={
                                                            link.active
                                                                ? 'page'
                                                                : undefined
                                                        }
                                                        className={cn(
                                                            'flex size-8 items-center justify-center rounded-full',
                                                            link.active
                                                                ? 'bg-background-darker'
                                                                : '',
                                                        )}
                                                        onClick={(e) => {
                                                            if (!handleNavigate(e, parseInt(link.label))) {
                                                                return false;
                                                            }
                                                        }}
                                                        {...linkProps}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                )}
                                            </PaginationItem>
                                        ),
                                    )}
                            </ul>
                        </div>
                        <div className="w-full text-center text-xs">
                            <span>
                                Showing {from} - {to} of{' '}
                                <span className="font-bold">{total}</span>
                            </span>
                        </div>
                    </div>
                    {/* Next Button */}
                    <div>
                        <PaginationItem className="list-none text-xs">
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
                                className={
                                    !next_page_url
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }
                                onClick={(e) => {
                                    if (next_page_url && !handleNavigate(e, current_page + 1)) {
                                        return false;
                                    }
                                }}
                            ></PaginationNext>
                        </PaginationItem>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaginationComponent;
