import Selector from '@/Components/atoms/Selector';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface TableRow {
    id: string;
    label: string;
    height: string;
}

interface RowVisibilitySelectorProps {
    rows: TableRow[];
    visibleRows: string[];
    onRowVisibilityChange: (visibleRowIds: string[]) => void;
    className?: string;
}

export default function RowVisibilitySelector({
    rows,
    visibleRows,
    onRowVisibilityChange,
    className = ''
}: RowVisibilitySelectorProps) {
    const { t } = useLaravelReactI18n();

    const rowOptions = rows.map(row => ({
        label: row.label,
        value: row.id
    }));

    return (
        <div className={`${className}`}>
            <Selector
                isMultiselect={true}
                selectedItems={visibleRows}
                setSelectedItems={onRowVisibilityChange}
                options={rowOptions}
                placeholder={t('proposalComparison.selectMetric')}
                data-testid="proposal-row-visibility-selector"
            />
        </div>
    );
}
