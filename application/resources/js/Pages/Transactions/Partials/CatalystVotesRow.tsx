import React from 'react';
import VoterHistoryData = App.DataTransferObjects.VoterHistoryData;

interface ColumnConfig<T> {
    key: string;
    header: string;
    width?: string;
    render: (item: T) => React.ReactNode;
}

// Renamed to match the component name and updated to use VoterHistoryData
interface CatalystVoteRowProps {
    voterHistory: VoterHistoryData;
    columns: ColumnConfig<VoterHistoryData>[];
}

const CatalystVoteRow: React.FC<CatalystVoteRowProps> = ({
    voterHistory,
    columns,
}) => {
    return (
        <tr className="border-gray-persist/30 border-b">
            {columns.map((column) => (
                <td
                    key={column.key}
                    className="border-gray-persist/30 border-r p-3 last:border-r-0"
                    style={column.width ? { width: column.width } : {}}
                >
                    {column.render(voterHistory)}
                </td>
            ))}
        </tr>
    );
};

export default CatalystVoteRow;
