export interface SearchResultCounts {
    proposals: number;
    people: number;
    groups: number;
    communities: number;
    reviews: number;
    articles: number;
}

export interface SearchResultData {
    proposals: any[];
    people: any[];
    groups: any[];
    communities: any[];
    reviews: any[];
    articles: any[];
}

export interface TabConfig {
    name: keyof SearchResultCounts;
    label: string;
}