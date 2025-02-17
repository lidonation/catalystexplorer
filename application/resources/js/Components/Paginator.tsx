import {
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/Pagination';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import React from 'react';
import { PaginatedData } from '../../types/paginated-data';
import { cn } from '@/lib/utils';

type PaginationComponentProps<T> = {
    pagination: PaginatedData<T>;
};

const PaginationComponent: React.FC<PaginationComponentProps<any>> = ({
    pagination,
}) => {
    const { setFilters } = useFilterContext();

    const setPagination = (param: string, value: number, label: string) => {
        setFilters({ param, value, label });
    };

    let {
        current_page,
        links,
        prev_page_url,
        next_page_url,
        from,
        to,
        total
    } = pagination;

    return (
        <div>
            <div className="container border-t border-background-light mb-3 flex w-full flex-col gap-2 pt-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Previous Button */}
                    <div>
                        <PaginationItem className="list-none">
                            <PaginationPrevious
                                onClick={
                                    prev_page_url
                                        ? () =>
                                            setPagination(
                                                ParamsEnum.PAGE,
                                                current_page - 1,
                                                'Current Page',
                                            )
                                        : () => ''
                                }
                                className={
                                    !prev_page_url
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }
                            ></PaginationPrevious>
                        </PaginationItem>
                    </div>
                    <div className='flex flex-col md:flex-row gap-4 items-center'>
                        {/* Page Numbers */}
                        <div className="flex flex-col justify-center gap-1">
                            <ul className="flex flex-wrap lg:flex-nowrap list-none items-center gap-2 text-sm lg:gap-5 lg:text-base">
                                {links &&
                                    links.map((link, index) =>
                                        link.label.includes('&laquo;') ||
                                            link.label.includes('&raquo;') ? null : (
                                            <PaginationItem
                                                key={index}
                                                className=""
                                            >
                                                {link.label === '...' ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            setPagination(
                                                                ParamsEnum.PAGE,
                                                                link.label,
                                                                'Current Page',
                                                            )
                                                        }
                                                        aria-current={
                                                            link.active
                                                                ? 'page'
                                                                : undefined
                                                        }
                                                        className={cn(
                                                            'rounded-full w-10 h-10 flex items-center justify-center',
                                                            link.active
                                                                ? 'bg-background-darker'
                                                                : ''
                                                        )}
                                                    >
                                                        {link.label}
                                                    </button>
                                                )}
                                            </PaginationItem>
                                        ),
                                    )}
                            </ul>
                        </div>
                        <div className="w-full text-center text-sm">
                            <span>
                                Showing {from} - {to} of <span className='font-bold'>{total}</span>
                            </span>
                        </div>
                    </div>
                    {/* Next Button */}
                    <div>
                        <PaginationItem className="list-none">
                            <PaginationNext
                                onClick={
                                    next_page_url
                                        ? () =>
                                            setPagination(
                                                ParamsEnum.PAGE,
                                                current_page + 1,
                                                'Current Page',
                                            )
                                        : () => ''
                                }
                                className={
                                    !next_page_url
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }
                            ></PaginationNext>
                        </PaginationItem>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaginationComponent;
