export interface TransitionListPageProps {
    onNavigate?: (pageIndex: number) => void;
}
export interface List {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    isPublic?: boolean;
}

export interface ListContextState {
    lists: List[];
    isLoadingLists: boolean;
    isAddingList: boolean;
    error: Error | null;
    latestAddedList: List | null;
}