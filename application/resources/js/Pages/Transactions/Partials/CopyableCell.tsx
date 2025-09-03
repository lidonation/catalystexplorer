import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';

const copyToClipboard = (text: string) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            console.log('Copied to clipboard:', text);
        })
        .catch((err) => {
            console.error('Failed to copy:', err);
        });
};

interface CopyableCellProps {
    displayText: string;
    fullText: string;
    title?: string;
}

const CopyableCell: React.FC<CopyableCellProps> = ({
    displayText,
    fullText,
    title,
}) => {
    const { t } = useLaravelReactI18n();

    return (
        <div className="flex items-center justify-center">
            <Paragraph size="sm" className="text-content max-w-xs truncate">
                {displayText || '-'}
            </Paragraph>
            {fullText && (
                <Button
                    onClick={() => copyToClipboard(fullText)}
                    className="ml-2 rounded-full p-1 hover:bg-gray-100"
                    ariaLabel={t('transactions.table.copyToClipboard')}
                >
                    <CopyIcon
                        width={16}
                        height={16}
                        className="text-gray-persist"
                    />
                </Button>
            )}
        </div>
    );
};

export default CopyableCell;
