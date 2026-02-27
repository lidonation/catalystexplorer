import { useEffect, useRef } from 'react';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { useProposalComparison } from '@/Context/ProposalComparisonContext';
import { useUserSetting } from '@/useHooks/useUserSettings';
import { userSettingEnums } from '@/enums/user-setting-enums';
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
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ComparisonTableFilters from './Partials/ComparisonTableFilters';
import RowVisibilitySelector from './Partials/RowVisibilitySelector';
import SortableProposalColumn from './SortableProposalColumn';
import { AiComparisonProvider, useAiComparisonContext } from '@/Context/AiComparisonContext';
import { Sparkles } from 'lucide-react';

function ProposalsTableInner() {
    const { t } = useLaravelReactI18n();
    const { filteredProposals } = useProposalComparison();
    const { isGenerating, generatingIds, results, error, generateComparison, generateForNewProposals, clearComparison } = useAiComparisonContext();
    const prevIdsRef = useRef<string[]>([]);
    const hasAnyGenerating = generatingIds.size > 0;

    useEffect(() => {
        const currentIds = filteredProposals
            .map((p) => p.id)
            .filter((id): id is string => id !== null && id !== undefined);

        const prevIds = prevIdsRef.current;
        prevIdsRef.current = currentIds;

        if (!results || results.length === 0) return;

        const prevSet = new Set(prevIds);
        const hasNewIds = currentIds.some((id) => !prevSet.has(id));

        if (hasNewIds && !hasAnyGenerating) {
            generateForNewProposals(currentIds);
        }
    }, [filteredProposals]);

    const handleGenerateComparison = async () => {
        const proposalIds = filteredProposals
            .map(proposal => proposal.id)
            .filter((id): id is string => id !== null && id !== undefined);

        if (proposalIds.length === 0) return;

        try {
            await generateComparison(proposalIds);
        } catch (err) {
            console.error('Failed to generate AI comparison:', err);
        }
    };

    const METRIC_ROW_ID = 'metric';
    const ACTION_ROW_ID = 'action';

    const AI_COMPARISON_ROW_ID = 'ai-comparison';
    const EXCLUDED_FROM_VISIBILITY = [METRIC_ROW_ID, ACTION_ROW_ID, AI_COMPARISON_ROW_ID];

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
        {
            id: 'problem',
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
        {
            id: 'ai-comparison',
            label: t('proposalComparison.tableHeaders.aiComparison'),
            height: '',
        },
    ];

    const controllableRows = rows.filter(
        (row) => !EXCLUDED_FROM_VISIBILITY.includes(row.id),
    );

    const {
        value: visibleRows,
        setValue: setVisibleRows,
        isLoading: isLoadingPreferences,
    } = useUserSetting<string[]>(
        userSettingEnums.PROPOSAL_COMPARISON,
        controllableRows.map((row) => row.id),
    );

    const { reorderProposals } = useProposalComparison();

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

    const visibleRowsData = rows.filter(
        (row) =>
            EXCLUDED_FROM_VISIBILITY.includes(row.id) ||
            (visibleRows && visibleRows.includes(row.id)),
    );

    return (
        <div className="container" data-testid="proposal-comparison-table">
                <div className="mb-4 flex items-center justify-between">
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
            <div className="bg-background border-gray-light relative mb-4 w-full rounded-lg border shadow-lg">
                <div className="flex">
                    {/* Sticky Row Headers */}
                    <div className="bg-background sticky left-0 z-10 flex flex-col rounded-l-lg">
                        {visibleRowsData.map((row) => (
                            <div
                                key={row.id}
                                className={`${row.height} ${row.id === 'ai-comparison' ? 'flex-1 items-start pt-4' : 'border-gray-light border-b items-center'} flex px-4 text-left font-medium ${row.id == 'metric' ? 'text-dark !bg-background-lighter rounded-tl-lg' : ''}`}
                                data-testid={`proposal-comparison-row-${row.id}`}
                            >
                                {row.id === 'ai-comparison' ? (
                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            <span>{row.label}</span>
                                        </div>

                                        {!results && !hasAnyGenerating && (
                                            <button
                                                onClick={handleGenerateComparison}
                                                disabled={filteredProposals.length < 2 || hasAnyGenerating}
                                                className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded text-xs hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                                            >
                                                <Sparkles className="h-3 w-3" />
                                                {t('proposalComparison.generateAiComparison')}
                                            </button>
                                        )}

                                        {hasAnyGenerating && (
                                            <div className="flex items-center gap-1 text-primary">
                                                <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full"></div>
                                                <span className="text-xs">
                                                    {t('proposalComparison.aiComparison.generating')}
                                                </span>
                                            </div>
                                        )}

                                        {error && (
                                            <div className="text-xs text-danger">
                                                {t('proposalComparison.aiComparison.errorLoading')}
                                            </div>
                                        )}

                                        {results && (
                                            <button
                                                onClick={clearComparison}
                                                className="text-[10px] text-content hover:text-dark px-1.5 py-0.5 border border-gray-light rounded hover:bg-background-lighter cursor-pointer w-fit"
                                            >
                                                {t('proposalComparison.aiComparison.clearResults')}
                                            </button>
                                        )}

                                        <div className="text-xs text-content leading-relaxed space-y-2">
                                            <p>
                                                {t('proposalComparison.aiComparison.description')}
                                            </p>
                                            <ul className="space-y-1 text-[11px]">
                                                <li><span className="text-dark font-medium">{t('proposalComparison.aiComparison.alignmentLabel')}</span> {t('proposalComparison.aiComparison.alignmentDesc')}</li>
                                                <li><span className="text-dark font-medium">{t('proposalComparison.aiComparison.feasibilityLabel')}</span> {t('proposalComparison.aiComparison.feasibilityDesc')}</li>
                                                <li><span className="text-dark font-medium">{t('proposalComparison.aiComparison.auditabilityLabel')}</span> {t('proposalComparison.aiComparison.auditabilityDesc')}</li>
                                            </ul>
                                            <p className="text-[11px]">
                                                {t('proposalComparison.aiComparison.scoreSummary')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    row.label
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Scrollable Draggable Columns */}
                    <div
                        className="border-gray-light overflow-x-auto border-l"
                        style={{ maxWidth: 'calc(100% - 120px)' }}
                        data-testid="proposal-comparison-scrollable-columns"
                    >
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex min-w-max items-stretch h-full">
                                <SortableContext
                                    items={filteredProposals.map((p) => p.id ?? '')}
                                    strategy={horizontalListSortingStrategy}
                                    data-testid="sortable-proposal-context"
                                >
                                {filteredProposals.map((proposal, index) => (
                                    <SortableProposalColumn
                                        key={proposal.id}
                                        proposal={proposal}
                                        isFirst={index === 0}
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
        </div>
    );
}

export default function ProposalsTable() {
    return (
        <AiComparisonProvider>
            <ProposalsTableInner />
        </AiComparisonProvider>
    );
}
