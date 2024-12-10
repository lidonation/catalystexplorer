export interface SearchResultCounts {
    proposals: number;
    people: number;
    groups: number;
    communities: number;
    reviews: number;
    posts: number;
}

export interface SearchResultData {
    proposals: any[];
    people: any[];
    groups: any[];
    communities: any[];
    reviews: any[];
    posts: any[];
}

export interface TabConfig {
    name: keyof SearchResultCounts;
    label: string;
}