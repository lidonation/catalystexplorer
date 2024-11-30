import {
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/Pagination';
import React from 'react';
import { PaginatedData } from '../../types/paginated-data';
import Selector from './Select';

type PaginationComponentProps = {
    pagination: PaginatedData<any>;
    perPage: number;
    setPerPage: (updatedItems: any) => void;
    setCurrentPage: (updatedItems: any) => void;
};

const PaginationComponent: React.FC<PaginationComponentProps> = ({
    pagination,
    perPage,
    setPerPage,
    setCurrentPage,
}) => {
    const { current_page, links, prev_page_url, next_page_url } = pagination;

    return (
        <div className="bt-12 mb-8 flex flex-col gap-8 border-t pt-12">
            <div className="w-40">
                <Selector
                    context="Per Page"
                    selectedItems={perPage}
                    setSelectedItems={setPerPage}
                    isMultiselect={false}
                    options={[
                        { label: 'Per page 8', value: '8' },
                        { label: 'Per page 12', value: '12' },
                        { label: 'Per page 16', value: '16' },
                        { label: 'Per page 24', value: '24' },
                    ]}
                />
            </div>
            <div className="flex items-center justify-between gap-4">
                {/* Previous Button */}
                <div>
                    <PaginationItem className="list-none">
                        <PaginationPrevious
                            onClick={
                                prev_page_url
                                    ? () => setCurrentPage(current_page - 1)
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
                <div className="flex items-center gap-6">
                    <ul className="hidden list-none gap-8 lg:flex">
                        {links &&
                            links.map((link, index) =>
                                link.label.includes('&laquo;') ||
                                link.label.includes('&raquo;') ? null : ( // Skip Previous/Next labels in links
                                    <PaginationItem key={index} className="">
                                        {link.label === '...' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    setCurrentPage(link.label)
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
                                    ? () => setCurrentPage(current_page + 1)
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
    );
};

export default PaginationComponent;
