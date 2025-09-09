import Selector from '@/Components/atoms/Selector';
import { useLaravelReactI18n } from 'laravel-react-i18n';

type ColumnKey = 
    | 'title' 
    | 'proposal' 
    | 'fund' 
    | 'status' 
    | 'funding' 
    | 'teams' 
    | 'yesVotes' 
    | 'abstainVotes' 
    | 'action' 
    | 'viewProposal'
    | 'budget'
    | 'category'
    | 'openSourced';

interface ColumnSelectorProps {
    selectedColumns: ColumnKey[];
    onSelectionChange: (columns: ColumnKey[]) => void;
    className?: string;
}

export default function ColumnSelector({
    selectedColumns,
    onSelectionChange,
    className = '',
}: ColumnSelectorProps) {
    const { t } = useLaravelReactI18n();

    const columnOptions = [
        { label: t('proposalComparison.tableHeaders.title'), value: 'title' as ColumnKey },
        { label: t('proposal'), value: 'proposal' as ColumnKey },
        { label: t('proposalComparison.tableHeaders.fund'), value: 'fund' as ColumnKey },
        { label: t('proposalComparison.tableHeaders.status'), value: 'status' as ColumnKey },
        { label: t('funding'), value: 'funding' as ColumnKey },
        { label: t('teams'), value: 'teams' as ColumnKey },
        { label: t('proposalComparison.tableHeaders.yesVotes'), value: 'yesVotes' as ColumnKey },
        { label: t('proposalComparison.tableHeaders.noVotes'), value: 'abstainVotes' as ColumnKey },
        { label: t('proposals.action'), value: 'viewProposal' as ColumnKey },
        { label: t('proposalComparison.tableHeaders.budget'), value: 'budget' as ColumnKey },
        { label: t('proposalComparison.tableHeaders.category'), value: 'category' as ColumnKey },
        { label: t('proposalComparison.tableHeaders.openSource'), value: 'openSourced' as ColumnKey },
    ];

    return (
        <div className={`${className}`}>
            <Selector
                isMultiselect={true}
                selectedItems={selectedColumns}
                setSelectedItems={onSelectionChange}
                options={columnOptions}
                placeholder={t('workflows.voterList.selectColumns')}
                data-testid="column-selector"
            />
        </div>
    );
}

export type { ColumnKey };
