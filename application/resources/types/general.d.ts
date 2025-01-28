export interface TransitionListPageProps {
    onNavigate?: (pageIndex: number) => void;
}
export interface List {
    id: string;
    title: string;
    content?: string | null;
    createdAt: string;
    visibility?: 'public' | 'private';
}

export interface ListContextState {
    lists: List[];
    isLoadingLists: boolean;
    isAddingList: boolean;
    error: Error | null;
    latestAddedList: List | null;
}