import React from 'react';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Paragraph from './Paragraph';

interface PageProps {
    errorBags?: {
        default?: {
            [key: string]: string | string[];
        };
    };
    [key: string]: any;
}

interface ErrorDisplayProps {
    className?: string;
    title?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    className = 'mb-6 p-2 lg:mx-8 mx-4 border border-error rounded-md max-w-2xl ',
    title,
}) => {
    const page = usePage<PageProps>();
    const { t } = useLaravelReactI18n();

    const translateMessage = (message: string): string => {
        if (
            typeof message === 'string' &&
            /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9][a-zA-Z0-9_]*)+$/.test(message)
        ) {
            try {
                const translated = t(message);
                console.log('Translation attempt:', {
                    original: message,
                    translated,
                });
                return translated;
            } catch (error) {
                console.warn('Translation failed for key:', message, error);
                return message;
            }
        }
        return message;
    };

    if (
        !page.props.errorBags?.default ||
        Object.keys(page.props.errorBags.default).length === 0
    ) {
        return null;
    }

    return (
        <div className={className}>
            <div className="text-error">
                {title && (
                    <Paragraph className="text-md mb-2 font-bold">
                        {title}
                    </Paragraph>
                )}
                <div className="text-sm">
                    {Object.entries(page.props.errorBags.default).map(
                        ([key, messages]) => (
                            <div key={key} className="mb-1">
                                {Array.isArray(messages) ? (
                                    messages.map((message, index) => (
                                        <Paragraph
                                            key={index}
                                            className="text-sm"
                                        >
                                            {translateMessage(String(message))}
                                        </Paragraph>
                                    ))
                                ) : (
                                    <Paragraph className="text-sm">
                                        {translateMessage(String(messages))}
                                    </Paragraph>
                                )}
                            </div>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;
