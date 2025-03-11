import Paragraph from '@/Components/atoms/Paragraph';
import ArrowDownIcon from '@/Components/svgs/ArrowDownIcon';
import ArrowUpIcon from '@/Components/svgs/ArrowUpIcon';
import React from 'react';


interface TableHeaderCellProps {
  label: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ 
  label, 
  sortable = false,
  sortDirection = null,
  onSort
}) => (
  <th className="px-6 py-3 border-r border-light-gray-persist">
    <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={sortable ? onSort : undefined}>
      <Paragraph className="text-dark">{label}</Paragraph>
      {sortable && (
        <div className="flex-col gap-2">
          <ArrowUpIcon 
            width={8} 
            height={6} 
            className={sortDirection === 'asc' ? 'text-primary' : 'text-dark'} 
          />
          <ArrowDownIcon 
            width={8} 
            height={5} 
            className={sortDirection === 'desc' ? 'text-primary' : 'text-dark'} 
          />
        </div>
      )}
    </div>
  </th>
);

export default TableHeaderCell;