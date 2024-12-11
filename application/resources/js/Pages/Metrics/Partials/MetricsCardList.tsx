import MetricCard from "./MetricCard";
import { MetricEnum } from "@/enums/metrics-enums";
import MetricData = App.DataTransferObjects.MetricData;

interface MetricProps {
  metrics: MetricData[];
  sortBy: keyof MetricData
  sortOrder: MetricEnum.ASCENDING | MetricEnum.DESCENDING
  columns: MetricEnum.TWO_COLUMNS | MetricEnum.THREE_COLUMNS
}

const MetricCardList: React.FC<MetricProps> = ({ metrics, sortBy, sortOrder, columns }) => {

  const sortedMetrics = [...metrics].sort((a, b) => {
    const isAsc = sortOrder === MetricEnum.ASCENDING;

    let valueA = a[sortBy] ?? (typeof a[sortBy] === 'number' ? 0 : new Date(0));
    let valueB = b[sortBy] ?? (typeof b[sortBy] === 'number' ? 0 : new Date(0));

    if (valueA instanceof Date) {
      valueA = valueA.getTime();
    } else if (typeof valueA !== 'number') {
      valueA = Number(valueA);
    }

    if (valueB instanceof Date) {
      valueB = valueB.getTime();
    } else if (typeof valueB !== 'number') {
      valueB = Number(valueB);
    }

    return isAsc ? valueA - valueB : valueB - valueA;
  });

  const columnClass = columns === MetricEnum.TWO_COLUMNS ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <ul className={`grid grid-cols-1 lg:grid-cols-2 xl:${columnClass} gap-6 mt-8`}>
      {
        sortedMetrics.map((metric, index) => (
          <li key={index}>
            <MetricCard metric={metric} />
          </li>
        ))
      }
    </ul>
  )
}

export default MetricCardList;
