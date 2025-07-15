import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { useProposalComparison } from '@/Context/ProposalComparisonContext';
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
import { useState } from 'react';
import RowVisibilitySelector from './Partials/RowVisibilitySelector';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { userSettingEnums } from '@/enums/user-setting-enums';



export default function ProposalsTable() {
    const { t } = useTranslation();
    const METRIC_ROW_ID = 'metric';
    const ACTION_ROW_ID = 'action';

    const EXCLUDED_FROM_VISIBILITY = [METRIC_ROW_ID, ACTION_ROW_ID];

    const rows = [
        {
            id: METRIC_ROW_ID,
            label: t('proposalComparison.tableHeaders.metric'),
            height: 'h-16',
        },
        {
            id: 'title',
            label: t('proposalComparison.tableHeaders.title'),
            height: 'h-32',
        },
         {
            id: 'campaign',
            label: t('proposalComparison.tableHeaders.campaign'),
            height: 'h-16',
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
        {id: 'problem',
            label: t('proposalComparison.tableHeaders.problem'),
            height: 'h-42',
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
            id: 'opensource',
            label: t('proposalComparison.tableHeaders.openSource'),
            height: 'h-16',
        },
        {
            id: ACTION_ROW_ID,
            label: t('proposalComparison.tableHeaders.action'),
            height: 'h-16',
        },
    ];

    const controllableRows = rows.filter(row => !EXCLUDED_FROM_VISIBILITY.includes(row.id));

     const {
        value: visibleRows,
        setValue: setVisibleRows,
        isLoading: isLoadingPreferences
    } = useUserSetting<string[]>(
        userSettingEnums.PROPOSAL_COMPARISON,
        controllableRows.map(row => row.id)
    );

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

   const visibleRowsData = rows.filter(row =>
        EXCLUDED_FROM_VISIBILITY.includes(row.id) || (visibleRows && visibleRows.includes(row.id))
    );

    return (
        <div className="container" data-testid="proposal-comparison-table">
             <div className="flex items-center justify-between mb-4">
            <header data-testid="proposal-comparison-header">
                <div className=" ">
                    <Title level="1">{t('proposalComparison.title')}</Title>
                </div>

                <div className=" ">
                    <Paragraph className="text-content">
                        {t('proposalComparison.subtitle')}
                    </Paragraph>
                </div>
            </header>

            <RowVisibilitySelector
                rows={controllableRows}
                visibleRows={visibleRows || []}
                onRowVisibilityChange={setVisibleRows}
            />
        </div>
            <div>
                <ComparisonTableFilters />
            </div>
            <div className="bg-background border-gray-light relative mb-4 flex w-full rounded-lg border shadow-lg">
                 {/* Sticky Row Headers */}
                <div className="bg-background sticky left-0 z-10 flex flex-col rounded-l-lg">
                    {visibleRowsData.map((row) => (
                        <div
                            key={row.id}
                            className={`${row.height} border-gray-light flex items-center border-b px-4 text-left font-medium ${row.id == 'metric' ? 'text-dark !bg-background-lighter rounded-tl-lg' : ''}`}
                            data-testid={`proposal-comparison-row-${row.id}`}
                        >
                            {row.label}
                        </div>
                    ))}
                </div>

                {/* Scrollable Draggable Columns */}
                <div
                    className="border-gray-light overflow-x-auto border-l "
                    style={{ maxWidth: 'calc(100% - 120px)' }}
                    data-testid="proposal-comparison-scrollable-columns"
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
                                data-testid="sortable-proposal-context"
                            >
                                 {filteredProposals.map((proposal, index) => (
                                    <SortableProposalColumn
                                        key={proposal.hash}
                                        proposal={proposal}
                                        isLast={
                                            index ===
                                            filteredProposals.length - 1
                                        }
                                        visibleRows={visibleRows || []}
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
