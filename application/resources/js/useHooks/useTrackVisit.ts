import { useEffect, useRef } from 'react';
import { useRecentlyVisited } from './useRecentlyVisited';

interface ProposalVisitData {
    id: string;
    title: string;
    slug: string;
    fund_label?: string;
}

interface ListVisitData {
    id: string;
    title: string;
    type?: string;
    items_count?: number;
}

export function useTrackProposalVisit(proposal: ProposalVisitData | null) {

    const { trackProposalVisit } = useRecentlyVisited();
    const trackedRef = useRef<string | null>(null);

    useEffect(() => {
        if (proposal && proposal.id && trackedRef.current !== proposal.id) {
            trackedRef.current = proposal.id;
            trackProposalVisit({
                id: proposal.id,
                title: proposal.title,
                slug: proposal.slug,
                fund_label: proposal.fund_label,
            });

        }

    }, [proposal?.id, proposal?.title, proposal?.slug, proposal?.fund_label, trackProposalVisit]

    )

} 

export function useTrackListVisit(list: ListVisitData | null) {

    const { trackListVisit } = useRecentlyVisited();
    const trackedRef = useRef<string | null>(null);

    useEffect(() => {
        if (list && list.id && trackedRef.current !== list.id) {
            trackedRef.current = list.id;
            trackListVisit({
                id: list.id,
                title: list.title,
                type: list.type,
                items_count: list.items_count,
            });

        }

    }, [list?.id, list?.title, list?.type, list?.items_count, trackListVisit]

    )

}