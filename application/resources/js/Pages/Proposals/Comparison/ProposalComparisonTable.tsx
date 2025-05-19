import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
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
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import ComparisonTableFilters from './Partials/ComparisonTableFilters';
import SortableProposalColumn from './SortableProposalColumn';
import { useProposalComparison } from '@/Context/ProposalComparisonContext';




export default function ProposalsTable() {
    const { t } = useTranslation();

    const rows = [
        {
            id: 'metric',
            label: t('proposalComparison.tableHeaders.metric'),
            height: 'h-16',
        },
        {
            id: 'title',
            label: t('proposalComparison.tableHeaders.title'),
            height: 'h-32',
        },
        {
            id: 'fund',
            label: t('proposalComparison.tableHeaders.fund'),
            height: 'h-16',
        },
        {
            id: 'status',
            label: t('proposalComparison.tableHeaders.status'),
            height: 'h-16',
        },
        {
            id: 'solution',
            label: t('proposalComparison.tableHeaders.solution'),
            height: 'h-42',
        },
        {
            id: 'funding',
            label: t('proposalComparison.tableHeaders.funding'),
            height: 'h-24',
        },
        {
            id: 'yes-votes',
            label: t('proposalComparison.tableHeaders.yesVotes'),
            height: 'h-16',
        },
        {
            id: 'no-votes',
            label: t('proposalComparison.tableHeaders.noVotes'),
            height: 'h-16',
        },
        {
            id: 'team',
            label: t('proposalComparison.tableHeaders.team'),
            height: 'h-16',
        },
        {
            id: 'action',
            label: t('proposalComparison.tableHeaders.action'),
            height: 'h-16',
        },
    ];

    const { filteredProposals, reorderProposals } = useProposalComparison();

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

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderProposals(active.id as string, over.id as string);
        }
    }

    return (
        <>
            <header>
                <div className="container">
                    <Title level="1">{t('proposalComparison.title')}</Title>
                </div>

                <div className="container">
                    <Paragraph className="text-content">
                        {t('proposalComparison.subtitle')}
                    </Paragraph>
                </div>
            </header>
            <ComparisonTableFilters />
            <div className="relative container mb-4 w-full">
                <div className="bg-background flex w-full gap-1 rounded-lg shadow-lg">
                    {/* Sticky Row Headers */}
                    <div className="bg-background sticky left-0 z-10 flex flex-col rounded-l-lg shadow-lg">
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
                                    items={filteredProposals.map(
                                        (p) => p.hash ?? '',
                                    )}
                                    strategy={horizontalListSortingStrategy}
                                >
                                    {filteredProposals.map((proposal) => (
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
        </>
    );
}
