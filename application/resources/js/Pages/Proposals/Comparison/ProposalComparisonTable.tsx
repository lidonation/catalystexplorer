'use client';

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
import { useState } from 'react';
import SortableProposalColumn from './SortableProposalColumn';
import ProposalData = App.DataTransferObjects.ProposalData;
import { IndexedDBService } from '@/Services/IndexDbService';

// Sample data based on the screenshot
const initialProposals: ProposalData[] = await IndexedDBService.getAll('proposal_comparisons')

const rows = [
    { id: 'reorder', label: 'Reorder', height: 'h-16' },
    { id: 'title', label: 'Title', height: 'h-32' },
    { id: 'fund', label: 'Fund', height: 'h-16' },
    { id: 'status', label: 'Status', height: 'h-16' },
    { id: 'solution', label: 'Solution', height: 'h-24' },
    { id: 'funding', label: 'Funding Received', height: 'h-24' },
    { id: 'yes-votes', label: 'Yes Votes', height: 'h-16' },
    { id: 'no-votes', label: 'No Votes', height: 'h-16' },
    { id: 'team', label: 'Team', height: 'h-16' },
    { id: 'action', label: 'Action', height: 'h-16' },
];

// Sortable column component

export default function ProposalsTable() {
    const [proposals, setProposals] = useState(initialProposals);

    // Configure sensors for drag detection
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

    // Handle drag end event
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setProposals((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.hash === active.id,
                );
                const newIndex = items.findIndex(
                    (item) => item.hash === over.id,
                );

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    return (
        <div className="relative rounded-lg border border-gray-200">
            <div className="flex">
                {/* Sticky Row Headers */}
                <div
                    className="sticky left-0 z-10 flex w-[120px] flex-col bg-gray-50 shadow-md"
                    style={{ boxShadow: '4px 0 6px -2px rgba(0, 0, 0, 0.05)' }}
                >
                    {rows.map((row) => (
                        <div
                            key={row.id}
                            className={`${row.height} flex items-center border-r border-b p-2 text-left font-medium text-gray-500`}
                        >
                            {row.label}
                        </div>
                    ))}
                </div>

                {/* Scrollable Draggable Columns */}
                <div
                    className="overflow-x-auto"
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
    );
}
