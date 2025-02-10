import {
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/Pagination';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import React from 'react';
import { PaginatedData } from '../../types/paginated-data';
import Selector from "@/Components/atoms/Selector";


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

    const {
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
        <div className="container mb-3 flex w-full flex-col items-center gap-2 border-t pt-8">
            <section className="flex w-full flex-row justify-center gap-2">
                <div className="flex items-start">
                    <Selector
                        context="Per Page"
                        selectedItems={per_page}
                        setSelectedItems={(value) =>
                            setPagination(
                                ProposalParamsEnum.LIMIT,
                                value,
                                'Per Page',
                            )
                        }
                        isMultiselect={false}
                        options={[
                            { label: 'Per page 8', value: '8' },
                            { label: 'Per page 12', value: '12' },
                            { label: 'Per page 16', value: '16' },
                            { label: 'Per page 24', value: '24' },
                            { label: 'Per page 36', value: '36' },
                        ]}
                    />
                </div>
                <div className="mx-auto flex items-center justify-center gap-4">
                    {/* Previous Button */}
                    <div>
                        <PaginationItem className="list-none">
                            <PaginationPrevious
                                onClick={
                                    prev_page_url
                                        ? () =>
                                              setPagination(
                                                  ProposalParamsEnum.PAGE,
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
                    {/* Page Numbers */}
                    <div className="flex flex-col justify-center gap-1">
                        <ul className="flex list-none items-center gap-3 text-sm lg:gap-5 lg:text-base">
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
                                                            ProposalParamsEnum.PAGE,
                                                            link.label,
                                                            'Current Page',
                                                        )
                                                    }
                                                    aria-current={
                                                        link.active
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    className={
                                                        link.active
                                                            ? 'text-primary font-bold'
                                                            : ''
                                                    }
                                                >
                                                    {link.label}
                                                </button>
                                            )}
                                        </PaginationItem>
                                    ),
                                )}
                        </ul>
                    </div>
                    {/* Next Button */}
                    <div>
                        <PaginationItem className="list-none">
                            <PaginationNext
                                onClick={
                                    next_page_url
                                        ? () =>
                                              setPagination(
                                                  ProposalParamsEnum.PAGE,
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
            </section>
            <section>
                <div className="w-full text-center text-sm">
                    <span>
                        Showing from {from} to {to} of {total}
                    </span>
                </div>
            </section>
        </div>
    );
};

export default PaginationComponent;
