import Value from '@/Components/atoms/Value';
import ValueLabel from '@/Components/atoms/ValueLabel';
import { copyToClipboard } from '@/utils/copyClipboard';
import { CopyIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DetailRowProps {
    label: string;
    value?: string | number | null;
    copyable?: boolean;
    background?: boolean;
    className?: string;
    children?: ReactNode;
}

export default function DetailRow({
    label,
    value = '',
    copyable = false,
    background = false,
    className = '',
    children,
}: DetailRowProps) {
    const displayValue =
        value !== null && value !== undefined ? String(value) : '';
    return (
        <div
            className={`border-gray-200 flex items-start border-b pb-4  ${className}`}
        >
            <ValueLabel className="text-gray-persist w-36">{label}</ValueLabel>

            {children ? (
                children
            ) : (
                <div className="flex flex-1 items-center">
                    <Value
                        className={`text-content mr-2 truncate font-bold ${background ? 'bg-background-lighter rounded-sm px-2 py-1' : ''}`}
                    >
                        {value ?? '-'}
                    </Value>

                    {value && copyable && (
                        <CopyIcon
                            className="h-4 w-4 cursor-pointer text-gray-400"
                            onClick={() => copyToClipboard(displayValue)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
