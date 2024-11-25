import ProposalData = App.DataTransferObjects.ProposalData;

export type PaginatedProposals = {
    current_page: number;
    data: ProposalData[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<any>;
    next_page_url: string;
    path: string;
    per_page: number;
    prev_page_url: string;
    to: number;
    total: number;
}
