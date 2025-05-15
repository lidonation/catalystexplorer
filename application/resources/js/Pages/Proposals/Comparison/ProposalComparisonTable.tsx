'use client';

import ModalLayout from '@/Layouts/ModalLayout';
import { useLiveQuery } from 'dexie-react-hooks';

import { IndexedDBService } from '@/Services/IndexDbService';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import SortableProposalColumn from './SortableProposalColumn';
import ProposalData = App.DataTransferObjects.ProposalData;

const rows = [
    { id: 'reorder', label: 'Reorder', height: 'h-16' },
    { id: 'title', label: 'Title', height: 'h-32' },
    { id: 'fund', label: 'Fund', height: 'h-16' },
    { id: 'status', label: 'Status', height: 'h-16' },
    { id: 'solution', label: 'Solution', height: 'h-42' },
    { id: 'funding', label: 'Funding Received', height: 'h-24' },
    { id: 'yes-votes', label: 'Yes Votes', height: 'h-16' },
    { id: 'no-votes', label: 'No Votes', height: 'h-16' },
    { id: 'team', label: 'Team', height: 'h-16' },
    { id: 'action', label: 'Action', height: 'h-16' },
];

// Sortable column component

export default function ProposalsTable() {
    const [proposals, setProposals] = useState<ProposalData[]>([]);

    const liveProposals = useLiveQuery(
        () => IndexedDBService.getAll('proposal_comparisons'),
        [],
    );

    useEffect(() => {
        if (liveProposals) {
            setProposals(liveProposals);
        }
    }, [liveProposals]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setProposals((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.hash === active.id,
                );
                const newIndex = items.findIndex(
                    (item) => item.hash === over.id,
                );
                const newOrder = arrayMove(items, oldIndex, newIndex);

                newOrder.forEach((item, index) => {
                    if (item.order !== index + 1 && item.hash) {
                        IndexedDBService.update(
                            'proposal_comparisons',
                            item.hash,
                            {
                                order: index + 1,
                            },
                        );
                    }
                });

                return newOrder.map((item, index) => ({
                    ...item,
                    order: index + 1,
                }));
            });
        }
    }

    return (
        <ModalLayout name="proposal-comparison">
            <div className="relative container mx-4 mb-4 w-full">
                <div className="bg-background flex w-full gap-1 rounded-lg shadow-lg">
                    {/* Sticky Row Headers */}
                    <div className="bg-background-lighter sticky left-0 z-10 flex flex-col shadow-md">
                        {rows.map((row) => (
                            <div
                                key={row.id}
                                className={`${row.height} border-gray-light flex items-center border-r border-b px-4 text-left font-medium text-gray-500`}
                            >
                                {row.label}
                            </div>
                        ))}
                    </div>

                    {/* Scrollable Draggable Columns */}
                    <div
                        className="border-gray-light overflow-x-auto border-l"
                        style={{ maxWidth: 'calc(100% - 120px)' }}
                    >
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex min-w-max">
                                <SortableContext
                                    items={proposals.map((p) => p.hash ?? '')}
                                    strategy={horizontalListSortingStrategy}
                                >
                                    {proposals.map((proposal) => (
                                        <SortableProposalColumn
                                            key={proposal.hash}
                                            proposal={proposal}
                                        />
                                    ))}
                                </SortableContext>
                            </div>
                        </DndContext>
                    </div>
                </div>
            </div>
        </ModalLayout>
    );
}
