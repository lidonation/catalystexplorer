import { ParamsEnum } from '@/enums/proposal-search-params';
import { IndexedDBService } from '@/Services/IndexDbService';
import { arrayMove } from '@dnd-kit/sortable';
import { liveQuery } from 'dexie';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { FilteredItem } from './FiltersContext';
import ProposalData = App.DataTransferObjects.ProposalData;
import { db } from '@/db/db';

type ProposalComparisonContextType = {
    proposals: ProposalData[];
    filteredProposals: ProposalData[];
    searchQuery: string;
    filters: FilteredItem[];
    filtersCount: number;
    setSearchQuery: (q: string) => void;
    setFilter: (item: FilteredItem) => void;
    getFilter: (param: ParamsEnum) => FilteredItem | undefined;
    removeFilter: (param: ParamsEnum) => void;
    updateProposalOrder: (newOrder: ProposalData[]) => Promise<void>;
    reorderProposals: (activeId: string, overId: string) => Promise<void>;
};

type SortDirection = 'asc' | 'desc';

const ProposalComparisonContext =
    createContext<ProposalComparisonContextType | null>(null);

export function ProposalComparisonProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [proposals, setProposals] = useState<ProposalData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilteredItem[]>([]);
    const [filtersCount, setFiltersCount] = useState<number>(0);

    useEffect(() => {
        const subscription = liveQuery(async () =>
            await db.proposal_comparisons.toArray(),
        ).subscribe({
            next: (result) => {
                setProposals(result);
            },
            error: (error) => {
                console.error('Error in liveQuery:', error);
            },
        });

        return () => subscription.unsubscribe();
    }, []);

    const getFilter = (param: ParamsEnum) =>
        filters.find((item) => item.param === param);

    const isEmpty = (value: any) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        if (Array.isArray(value) && value.length === 0) return true;
        return false;
    };

    const setFilter = (newItem: FilteredItem) => {
        setFilters((prev) => {
            const existingIndex = prev.findIndex(
                (f) => f.param === newItem.param,
            );
            const isSameValue =
                existingIndex >= 0 &&
                JSON.stringify(prev[existingIndex].value) ===
                    JSON.stringify(newItem.value);

            // Remove filter if value is empty
            if (isEmpty(newItem.value)) {
                const withoutItem = prev.filter(
                    (f) => f.param !== newItem.param,
                );
                setFiltersCount(withoutItem.length);
                return withoutItem;
            }

            // No change if value is same
            if (isSameValue) {
                return prev;
            }

            // Update or add filter
            const updated =
                existingIndex >= 0
                    ? [
                          ...prev.slice(0, existingIndex),
                          newItem,
                          ...prev.slice(existingIndex + 1),
                      ]
                    : [...prev, newItem];

            setFiltersCount(updated.length);
            return updated;
        });
    };

    const removeFilter = (param: ParamsEnum) => {
        setFilters((prev) => prev.filter((item) => item.param !== param));
    };
    

    const filteredProposals = useMemo(() => {
        let filtered = [...proposals];

        if (searchQuery) {
            filtered = filtered.filter((p) =>
                p.title?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        const fundsFilter = getFilter(ParamsEnum.FUNDS);
        if (fundsFilter?.value?.length) {
            filtered = filtered.filter((p) =>
                fundsFilter.value.includes(p.fund?.label),
            );
        }

        const statusFilter = getFilter(ParamsEnum.PROJECT_STATUS);
        if (statusFilter?.value?.length) {
            filtered = filtered.filter((p) =>
                statusFilter.value.includes(p.status),
            );
        }

        const sortFilter = getFilter(ParamsEnum.SORTS);

        if (sortFilter?.value) {
            const [field, direction] = sortFilter.value.split(':') as [
                keyof ProposalData,
                SortDirection,
            ];

            filtered.sort((a, b) => {
                const aValue = a[field];
                const bValue = b[field];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                return direction === 'asc'
                    ? (aValue as number) - (bValue as number)
                    : (bValue as number) - (aValue as number);
            });
        }

        return filtered;
    }, [proposals, searchQuery, filters]);    

    const updateProposalOrder = async (newOrder: ProposalData[]) => {
        setProposals(newOrder);

        const total = newOrder.length;

        await Promise.all(
            newOrder.map((item, index) =>
                item.hash
                    ? IndexedDBService.update(
                          'proposal_comparisons',
                          item.hash,
                          {
                              order: total - index,
                          },
                      )
                    : Promise.resolve(),
            ),
        );
    };

    const reorderProposals = async (activeId: string, overId: string) => {
        if (activeId === overId) return;
        const oldIndex = proposals.findIndex((item) => item.hash === activeId);
        const newIndex = proposals.findIndex((item) => item.hash === overId);
        if (oldIndex === -1 || newIndex === -1) return;
        const newOrder = arrayMove(proposals, oldIndex, newIndex);
        await updateProposalOrder(newOrder);
    };

    return (
        <ProposalComparisonContext.Provider
            value={{
                proposals,
                filteredProposals,
                searchQuery,
                filters,
                filtersCount,
                setSearchQuery,
                setFilter,
                getFilter,
                removeFilter,
                updateProposalOrder,
                reorderProposals,
            }}
        >
            {children}
        </ProposalComparisonContext.Provider>
    );
}

export const useProposalComparison = () => {
    const context = useContext(ProposalComparisonContext);
    if (!context) {
        throw new Error(
            'useProposalComparison must be used within a ProposalComparisonProvider',
        );
    }
    return context;
};
