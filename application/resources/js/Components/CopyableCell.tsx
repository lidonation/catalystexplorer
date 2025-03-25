import React from 'react';
import CopyIcon from '@/Components/svgs/CopyIcon';
import Paragraph from '@/Components/atoms/Paragraph';
import Button from '@/Components/atoms/Button';
import { useTranslation } from 'react-i18next';


const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log("Copied to clipboard:", text);
    })
    .catch(err => {
      console.error("Failed to copy:", err);
    });
};

interface CopyableCellProps {
  displayText: string;
  fullText: string;
  title?: string;
}

const CopyableCell: React.FC<CopyableCellProps> = ({ displayText, fullText, title }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center">
      <Paragraph size="sm" className="text-content truncate max-w-xs">
        {displayText || '-'}
      </Paragraph>
      {fullText && (
        <Button
          onClick={() => copyToClipboard(fullText)}
          className="ml-2 p-1 hover:bg-gray-100 rounded-full"
          ariaLabel={t('copyToClipboard')}
        >
          <CopyIcon width={16} height={16} className="text-gray-persist" />
        </Button>
      )}
    </div>
  );
};

export default CopyableCell;