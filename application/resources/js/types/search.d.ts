export interface SearchResultCounts {
    proposals: number;
    ideascaleProfiles: number;
    groups: number;
    communities: number;
    reviews: number;
    articles: number;
}

export interface SearchResultData {
    proposals: any[];
    ideascaleProfiles: any[];
    groups: any[];
    communities: any[];
    reviews: any[];
    articles: any[];
}

export interface TabConfig {
    name: keyof SearchResultData;
    label: string;
}
