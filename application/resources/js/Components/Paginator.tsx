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
    const pageLinks = links?.filter(
        link => !link.label.includes('&laquo;') && 
                !link.label.includes('&raquo;') && 
                link.label !== 'Previous' && 
                link.label !== 'Next'
    ) || [];
    const getMobilePageLinks = () => {
        if (pageLinks.length <= 7) return pageLinks;
        
        const currentIdx = pageLinks.findIndex(link => link.active);
        const current_page_num = parseInt(pageLinks[currentIdx]?.label || '1');
        
        const startPage = Math.max(1, current_page_num - 2);
        const endPage = Math.min(pageLinks.length, current_page_num + 2);
        
        const result = [];
        
        if (startPage > 1) {
            result.push(pageLinks[0]);
            if (startPage > 2) {
                result.push({ label: '...', active: false, url: null });
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageLink = pageLinks.find(link => parseInt(link.label) === i);
            if (pageLink) {
                result.push(pageLink);
            }
        }
       
        
        return result;
    };

    const mobilePageLinks = getMobilePageLinks();

    return (
        <div className="flex items-center justify-center py-4" data-testid="pagination-component">
            <div className="flex md:hidden items-center justify-between w-full gap-1">
                <PaginationItem className="list-none flex-shrink-0">
                    <PaginationPrevious
                        linkProps={linkProps}
                        href={
                            prev_page_url
                                ? buildUrl(ParamsEnum.PAGE, current_page - 1, 'Current Page')
                                : ''
                        }
                        className={cn(
                            "px-2 py-1 text-xs",
                            !prev_page_url ? 'pointer-events-none opacity-50' : ''
                        )}
                    />
                </PaginationItem>
                <div className="flex-1 flex justify-center min-w-0">
                    <ul className="flex list-none items-center gap-1">
                        {mobilePageLinks.map((link, index) => (
                            <PaginationItem key={index}>
                                {link.label === '...' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <Link
                                        href={buildUrl(ParamsEnum.PAGE, link.label, 'Current Page')}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPagination(ParamsEnum.PAGE, link.label, 'Current Page');
                                        }}
                                        aria-current={link.active ? 'page' : undefined}
                                        className={cn(
                                            'flex size-7 items-center justify-center rounded-full text-xs',
                                            link.active ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'
                                        )}
                                        {...linkProps}
                                        data-testid={`pagination-link-${link.label}`}
                                    >
                                        {link.label}
                                    </Link>
                                )}
                            </PaginationItem>
                        ))}
                    </ul>
                </div>
                <PaginationItem className="list-none flex-shrink-0">
                    <PaginationNext
                        linkProps={linkProps}
                        href={
                            next_page_url
                                ? buildUrl(ParamsEnum.PAGE, current_page + 1, 'Current Page')
                                : ''
                        }
                        className={cn(
                            "px-2 py-1 text-xs",
                            !next_page_url ? 'pointer-events-none opacity-50' : ''
                        )}
                    />
                </PaginationItem>
            </div>
            <div className="hidden md:flex lg:hidden items-center justify-between w-full">
                <PaginationItem className="list-none">
                    <PaginationPrevious
                        linkProps={linkProps}
                        href={
                            prev_page_url
                                ? buildUrl(ParamsEnum.PAGE, current_page - 1, 'Current Page')
                                : ''
                        }
                        className={!prev_page_url ? 'pointer-events-none opacity-50' : ''}
                    />
                </PaginationItem>

                <div className="flex items-center gap-4">
                    <ul className="flex list-none items-center gap-1">
                        {mobilePageLinks.map((link, index) => (
                            <PaginationItem key={index}>
                                {link.label === '...' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <Link
                                        href={buildUrl(ParamsEnum.PAGE, link.label, 'Current Page')}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPagination(ParamsEnum.PAGE, link.label, 'Current Page');
                                        }}
                                        aria-current={link.active ? 'page' : undefined}
                                        className={cn(
                                            'flex size-8 items-center justify-center rounded-full text-sm',
                                            link.active ? 'bg-gray-200' : ''
                                        )}
                                        {...linkProps}
                                        data-testid={`pagination-link-${link.label}`}
                                    >
                                        {link.label}
                                    </Link>
                                )}
                            </PaginationItem>
                        ))}
                    </ul>
                    
                    <div className="text-sm" data-testid="pagination-info">
                        {from}-{to} of <span className="font-bold">{total}</span>
                    </div>
                </div>

                <PaginationItem className="list-none">
                    <PaginationNext
                        linkProps={linkProps}
                        href={
                            next_page_url
                                ? buildUrl(ParamsEnum.PAGE, current_page + 1, 'Current Page')
                                : ''
                        }
                        className={!next_page_url ? 'pointer-events-none opacity-50' : ''}
                    />
                </PaginationItem>
            </div>
            <div className="hidden lg:flex items-center justify-between w-full">
                <div className="flex-shrink-0">
                    <PaginationItem className="list-none">
                        <PaginationPrevious
                            linkProps={linkProps}
                            href={
                                prev_page_url
                                    ? buildUrl(ParamsEnum.PAGE, current_page - 1, 'Current Page')
                                    : ''
                            }
                            className={!prev_page_url ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-1">
                        <ul className="flex list-none items-center gap-1">
                            {pageLinks.map((link, index) => (
                                <PaginationItem key={index}>
                                    {link.label === '...' ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <Link
                                            href={buildUrl(ParamsEnum.PAGE, link.label, 'Current Page')}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPagination(ParamsEnum.PAGE, link.label, 'Current Page');
                                            }}
                                            aria-current={link.active ? 'page' : undefined}
                                            className={cn(
                                                'flex size-8 items-center justify-center rounded-full',
                                                link.active ? 'bg-gray-200' : ''
                                            )}
                                            {...linkProps}
                                            data-testid={`pagination-link-${link.label}`}
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </PaginationItem>
                            ))}
                        </ul>
                    </div>
                    <div className="text-sm" data-testid="pagination-info">
                        Showing {from} - {to} of <span className="font-bold">{total}</span>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <PaginationItem className="list-none">
                        <PaginationNext
                            linkProps={linkProps}
                            href={
                                next_page_url
                                    ? buildUrl(ParamsEnum.PAGE, current_page + 1, 'Current Page')
                                    : ''
                            }
                            className={!next_page_url ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                </div>
            </div>
        </div>
    );
};

export default PaginationComponent;