import { db } from '@/db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';

const MAX_RECENT_ITEMS = 5;

interface UseRecentlyVisitedReturn {
    recentProposals: App.DataTransferObjects.RecentlyVisitedProposalData[];
    recentLists: App.DataTransferObjects.RecentlyVisitedListData[];
    isLoading: boolean;
    trackProposalVisit: (proposal: {
        id: string;
        title: string;
        slug: string;
        fund_label?: string;
    }) => Promise<void>;
    trackListVisit: (list: {
        id: string;
        title: string;
        type?: string;
        items_count?: number;
    }) => Promise<void>;
    clearRecentProposals: () => Promise<void>;
    clearRecentLists: () => Promise<void>;
}

export function useRecentlyVisited(): UseRecentlyVisitedReturn {
    const recentProposals = useLiveQuery(
        async () => {
            return await db.recently_visited_proposals
                .orderBy('visited_at')
                .reverse()
                .limit(MAX_RECENT_ITEMS)
                .toArray();
        },
        [],
        []
    )

    const recentLists = useLiveQuery(
        async () => {
            return await db.recently_visited_lists
                .orderBy('visited_at')
                .reverse()
                .limit(MAX_RECENT_ITEMS)
                .toArray();
        },
        [],
        []
    )

    const trackProposalVisit = useCallback(
        async (proposal: {
            id: string;
            title: string;
            slug: string;
            fund_label?: string;
        }) => {
            const now = Date.now();
            const existing = await db.recently_visited_proposals.get(proposal.id);

            if (existing) {
                await db.recently_visited_proposals.update(proposal.id, {
                    title: proposal.title,
                    slug: proposal.slug,
                    fund_label: proposal.fund_label,
                    visited_at: now,
                    visit_count: existing.visit_count + 1,
                });
            } else {
                const count = await db.recently_visited_proposals.count();
                if (count >= MAX_RECENT_ITEMS) {
                    const oldest = await db.recently_visited_proposals
                        .orderBy('visited_at')
                        .first();
                    if (oldest) {
                        await db.recently_visited_proposals.delete(oldest.id);
                    }
                }
                await db.recently_visited_proposals.add({
                    id: proposal.id,
                    title: proposal.title,
                    slug: proposal.slug,
                    fund_label: proposal.fund_label,
                    visited_at: now,
                    visit_count: 1,
                });
            }


        }, []

    );

    const trackListVisit = useCallback(
        async (list: {
            id: string;
            title: string;
            type?: string;
            items_count?: number;
        }) => {
            const now = Date.now();
            const existing = await db.recently_visited_lists.get(list.id);

            if (existing) {
                await db.recently_visited_lists.update(list.id, {
                    title: list.title,
                    type: list.type,
                    items_count: list.items_count,
                    visited_at: now,
                    visit_count: existing.visit_count + 1,
                });
            } else {
                const count = await db.recently_visited_lists.count();
                if (count >= MAX_RECENT_ITEMS) {
                    const oldest = await db.recently_visited_lists
                        .orderBy('visited_at')
                        .first();
                    if (oldest) {
                        await db.recently_visited_lists.delete(oldest.id);
                    }
                }

                await db.recently_visited_lists.add({
                    id: list.id,
                    title: list.title,
                    type: list.type,
                    items_count: list.items_count,
                    visited_at: now,
                    visit_count: 1,
                });
            }
        },
        []
    );

    const clearRecentProposals = useCallback(async () => {
        await db.recently_visited_proposals.clear();
    }, []);

    const clearRecentLists = useCallback(async () => {
        await db.recently_visited_lists.clear();
    }, []);

     const isLoading = recentProposals === undefined || recentLists === undefined;

     return {
        recentProposals: recentProposals || [],
        recentLists: recentLists || [],
        isLoading,
        trackProposalVisit,
        trackListVisit,
        clearRecentProposals,
        clearRecentLists,
     }

}