import { ReactNode } from "react";

export interface TransitionListPageProps {
    onNavigate?: (pageIndex: number) => void;
    children?: ReactNode
}
export interface List {
    id: string;
    title: string;
    content?: string;
    createdAt?: string;
    visibility?: 'public' | 'unlisted' | 'private';
}

export interface ListContextState {
    lists: List[];
    isLoadingLists: boolean;
    isAddingList: boolean;
    error: Error | null;
    latestAddedList: List | null;
}