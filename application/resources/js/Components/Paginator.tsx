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
    setPerPage?: (updatedItems: number) => void;
    setCurrentPage?: (updatedItems: number) => void;
};

const PaginationComponent: React.FC<PaginationComponentProps<any>> = ({
    pagination,
    setPerPage,
    setCurrentPage,
}) => {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();

    const setPagination = (key: keyof ProposalSearchParams, value: number) => {
        setFilters(key, value);
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
        <div className="flex w-full flex-col items-center  border-t pt-12 gap-8 container">
            <section className='flex w-full flex-row justify-center gap-2'>
                <div className="flex items-start">
                    <Selector
                        context="Per Page"
                        selectedItems={per_page}
                        setSelectedItems={(value) =>
                            setPagination(ProposalParamsEnum.LIMIT, value)
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
                <div className="flex mx-auto items-center justify-center gap-4">
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
                    <div className='flex flex-col gap-1 justify-center'>
                        <ul className="flex list-none items-center gap-3 text-sm lg:gap-8 lg:text-base">
                            {links &&
                                links.map((link, index) =>
                                    link.label.includes('&laquo;') ||
                                    link.label.includes('&raquo;') ? null : (
                                        <PaginationItem key={index} className="">
                                            {link.label === '...' ? (
                                                <PaginationEllipsis/>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setPagination(
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
                                              setPagination(
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
