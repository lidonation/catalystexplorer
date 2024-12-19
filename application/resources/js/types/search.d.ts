export interface SearchResultCounts {
    proposals: number;
    ideascaleprofiles: number;
    groups: number;
    communities: number;
    reviews: number;
    articles: number;
}

export interface SearchResultData {
    proposals: any[];
    ideascaleprofiles: any[];
    groups: any[];
    communities: any[];
    reviews: any[];
    articles: any[];
}

export interface TabConfig {
    name: keyof SearchResultCounts;
    label: string;
}
