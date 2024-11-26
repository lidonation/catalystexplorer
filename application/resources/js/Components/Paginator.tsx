import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/Pagination';
import React from 'react';
import Selector from './Selector';

type PaginationData = {
    current_page: number;
    first_page_url: string;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    prev_page_url: string | null;
};

type PaginationComponentProps = {
    pagination: PaginationData;
    perPage: string;
    currentPage: string;
    onChangePerPage: (updatedItems: string[]) => void;
    onChangeCurrentPage: (updatedItems: string[]) => void;
};

const PaginationComponent: React.FC<PaginationComponentProps> = ({
    pagination,
    currentPage,
    perPage,
    onChangePerPage,
    onChangeCurrentPage,
}) => {
    const { current_page, links, prev_page_url, next_page_url } = pagination;

    return (
        <div className="bt-12 mb-8 flex flex-col gap-8 border-t pt-12">
            <div className="w-36">
                <Selector
                    basic
                    context="Per Page"
                    selectedItems={perPage}
                    setSelectedItems={onChangePerPage}
                    isMultiselect={false}
                    options={{ '0': '8', '1': '12', '2': '16', '3': '24' }}
                />
            </div>
            <Pagination className="flex items-center justify-between gap-4">
                {/* Previous Button */}
                <div>
                    <PaginationItem className="list-none">
                        <PaginationPrevious
                            href={prev_page_url || '#'}
                            className={
                                !prev_page_url
                                    ? 'pointer-events-none opacity-50'
                                    : ''
                            }
                        />
                    </PaginationItem>
                </div>
                {/* Page Numbers */}
                <div className="flex items-center gap-6">
                    <PaginationContent className="list-none gap-8">
                        {links.map((link, index) =>
                            link.label.includes('&laquo;') ||
                            link.label.includes('&raquo;') ? null : ( // Skip Previous/Next labels in links
                                <PaginationItem key={index}>
                                    {link.label === '...' ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            href={link.url || '#'}
                                            isActive={link.active}
                                            className={
                                                link.active
                                                    ? 'text-primary-secondary font-bold'
                                                    : ''
                                            }
                                        >
                                            {link.label}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ),
                        )}
                    </PaginationContent>
                </div>
                {/* Next Button */}
                <div>
                    <PaginationItem className="list-none">
                        <PaginationNext
                            href={next_page_url || '#'}
                            className={
                                !next_page_url
                                    ? 'pointer-events-none opacity-50'
                                    : ''
                            }
                        />
                    </PaginationItem>
                </div>
            </Pagination>
        </div>
    );
};

export default PaginationComponent;
