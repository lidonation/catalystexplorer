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
import { ProposalSearchParams } from '../../types/proposal-search-params';
import Selector from './Select';

type PaginationComponentProps<T> = {
    pagination: PaginatedData<T>;
    setPerPage?: (updatedItems: any) => void;
    setCurrentPage?: (updatedItems: any) => void;
};

const PaginationComponent: React.FC<PaginationComponentProps<any>> = ({
    pagination,
    setPerPage,
    setCurrentPage,
}) => {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();

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
        <div className="mb-8 flex w-full flex-col items-center border-t pt-12 lg:gap-8">
            <div className="flex w-full items-start lg:pl-8">
                <Selector
                    context="Per Page"
                    selectedItems={per_page}
                    setSelectedItems={(value) =>
                        setFilters(ProposalParamsEnum.LIMIT, value)
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
            <div className="flex w-full items-center justify-center gap-4 px-4 lg:justify-between">
                {/* Previous Button */}
                <div>
                    <PaginationItem className="list-none">
                        <PaginationPrevious
                            onClick={
                                prev_page_url
                                    ? () =>
                                          setFilters(
                                              ProposalParamsEnum.PAGE,
                                              current_page - 1,
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
                <div>
                    <ul className="flex list-none items-center gap-3 text-sm lg:gap-8 lg:text-base">
                        {links &&
                            links.map((link, index) =>
                                link.label.includes('&laquo;') ||
                                link.label.includes('&raquo;') ? null : (
                                    <PaginationItem key={index} className="">
                                        {link.label === '...' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    setFilters(
                                                        ProposalParamsEnum.PAGE,
                                                        link.label,
                                                    )
                                                }
                                                aria-current={
                                                    link.active
                                                        ? 'page'
                                                        : undefined
                                                }
                                                className={
                                                    link.active
                                                        ? 'font-bold text-primary'
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
                                          setFilters(
                                              ProposalParamsEnum.PAGE,
                                              current_page + 1,
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
            <div className="flex w-full items-center justify-end text-sm lg:pr-8">
                <span>
                    Showing from {from} to {to} of {total}
                </span>
            </div>
        </div>
    );
};

export default PaginationComponent;
