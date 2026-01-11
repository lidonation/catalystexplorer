import Button from '@/Components/atoms/Button';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState } from 'react';

interface CopyButtonProps {
    textToCopy: string;
    className?: string;
    iconSize?: number;
    showFeedback?: boolean;
    ariaLabel?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
    textToCopy,
    className = '',
    iconSize = 16,
    showFeedback = true,
    ariaLabel,
}) => {
    const { t } = useLaravelReactI18n();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            if (showFeedback) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    return (
        <Button
            onClick={handleCopy}
            className={`relative rounded-full p-1 hover:bg-gray-100 transition-colors ${className}`}
            ariaLabel={ariaLabel || t('copyToClipboard')}
        >
            <CopyIcon
                width={iconSize}
                height={iconSize}
                className={`text-gray-persist transition-colors ${
                    copied ? 'text-green-500' : 'hover:text-content'
                }`}
            />
            {showFeedback && copied && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {t('copied')}
                </div>
            )}
        </Button>
    );
};

export default CopyButton;