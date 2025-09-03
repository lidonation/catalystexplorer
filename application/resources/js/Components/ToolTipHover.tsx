import Paragraph from '@/Components/atoms/Paragraph';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';

interface ToolTipHoverProps {
    props: any;
    className?: string;
}

const ToolTipHover: React.FC<ToolTipHoverProps> = ({
    props,
    className = '',
}) => {
    const { t } = useLaravelReactI18n();

    return (
        <div className="relative flex justify-center">
            <div>
                {/* <div className="bg-tooltip absolute -bottom-2 left-1/2 z-0 h-4 w-4 -translate-x-1/2 rotate-45 transform"></div> */}
                <Paragraph
                    size="sm"
                    className="rounded border-2 border-black bg-white px-2 py-1 text-xs whitespace-nowrap text-black shadow-md"
                >
                    {props}
                </Paragraph>
            </div>
        </div>
    );
};

export default ToolTipHover;
