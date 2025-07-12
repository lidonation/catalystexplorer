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

    let {
        current_page,
        per_page,
        links,
        prev_page_url,
        next_page_url,
        from,
        to,
        total,
    } = pagination;

    return (
        <div className="flex items-center justify-center py-4" data-testid="pagination-component">
            <div className="flex items-center justify-between w-full">
                <div className="flex-shrink-0">
                    <PaginationItem className="list-none">
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
                        />
                    </PaginationItem>
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-1">
                        <ul className="flex list-none items-center gap-1">
                            {links &&
                                links.map((link, index) =>
                                    link.label.includes('&laquo;') ||
                                    link.label.includes('&raquo;') ? null : (
                                        <PaginationItem key={index}>
                                            {link.label === '...' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <Link
                                                    href={buildUrl(
                                                        ParamsEnum.PAGE,
                                                        link.label,
                                                        'Current Page',
                                                    )}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setPagination(
                                                            ParamsEnum.PAGE,
                                                            link.label,
                                                            'Current Page',
                                                        );
                                                    }}
                                                    aria-current={
                                                        link.active
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    className={cn(
                                                        'flex size-8 items-center justify-center rounded-full',
                                                        link.active
                                                            ? 'bg-gray-200'
                                                            : '',
                                                    )}
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
                    <div className="text-sm">
                        Showing {from} - {to} of{' '}
                        <span className="font-bold">{total}</span>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <PaginationItem className="list-none">
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
                        />
                    </PaginationItem>
                </div>
            </div>
        </div>
    );
};

export default PaginationComponent;
