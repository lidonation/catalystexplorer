import ValueLabel from '@/Components/atoms/ValueLabel';
import { HTMLAttributes } from 'react';

interface KeyValueProps extends HTMLAttributes<HTMLDivElement> {
    valueKey: string;
    value: string | number;
    className?: string;
}

export default function KeyValue({
    valueKey,
    value,
    className = '',
    ...props
}: KeyValueProps) {
    return (
        <div
            className={`text-content space-y-0 text-lg font-semibold ${className}`}
            {...props}
        >
            <div className="text-2xl">{value}</div>
            <ValueLabel>
                <span>{valueKey}</span>
            </ValueLabel>
        </div>
    );
}
