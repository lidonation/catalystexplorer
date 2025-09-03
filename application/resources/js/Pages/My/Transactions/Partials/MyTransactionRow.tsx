import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import TransactionData = App.DataTransferObjects.TransactionData;

interface ColumnConfig<T> {
    key: string;
    header: string;
    width?: string;
    render: (item: T) => React.ReactNode;
}

interface TransactionRowProps {
    transaction: TransactionData;
    columns: ColumnConfig<TransactionData>[];
    onViewDetails?: () => void;
}

const MyTransactionRow: React.FC<TransactionRowProps> = ({
    transaction,
    columns,
}) => {
    const { t } = useLaravelReactI18n();

    const localizedRoute = useLocalizedRoute('jormungandr.transactions.show', {
        transaction: transaction?.tx_hash,
    });

    const handleViewDetails = () => {
        router.visit(localizedRoute);
    };

    return (
        <tr className="border-background-lighter border-b">
            {columns.map((column) => (
                <td
                    key={column.key}
                    className="border-background-lighter border-r p-3"
                    style={column.width ? { width: column.width } : {}}
                >
                    {column.render(transaction)}
                </td>
            ))}
            <td className="p-3">
                <Button
                    onClick={handleViewDetails}
                    className="bg-primary px-4 py-2 text-sm"
                    ariaLabel={t('transactions.table.viewDetails')}
                >
                    <Paragraph size="sm" className="text-white">
                        {t('transactions.table.view')}
                    </Paragraph>
                </Button>
            </td>
        </tr>
    );
};

export default MyTransactionRow;
