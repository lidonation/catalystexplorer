import React, {HTMLAttributes} from "react";
import ValueLabel from "@/Components/atoms/ValueLabel";

interface KeyValueProps extends HTMLAttributes<HTMLDivElement> {
    valueKey: string;
    value: string | number;
    className?: string;
}

export default function KeyValue({valueKey, value, className = '', ...props}: KeyValueProps) {
    return (
        <div className={`text-content text-lg font-semibold space-y-0 ${className}`} {...props}>
            <div className='text-2xl'>
                {value}
            </div>
            <ValueLabel>
                <span>{valueKey}</span>
            </ValueLabel>
        </div>
    );
}
