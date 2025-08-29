import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Paragraph from './Paragraph';
import CloseIcon from '../svgs/CloseIcon';
import Button from './Button';

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
    className = ' my-3 p-2 px-8 lg:mx-8 mx-4 border border-error rounded-md max-w-2xl mx-auto',
    title,
}) => {
    const page = usePage<PageProps>();
    const { t } = useLaravelReactI18n();
    const [isVisible, setIsVisible] = useState(true);

    // Reset visibility when errors change
    useEffect(() => {
        if (page.props.errorBags?.default && Object.keys(page.props.errorBags.default).length > 0) {
            setIsVisible(true);
        }
    }, [page.props.errorBags]);

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
        !isVisible ||
        !page.props.errorBags?.default ||
        Object.keys(page.props.errorBags.default).length === 0
    ) {
        return null;
    }

    return (
        <div className='flex w-full justify-center items-center'>
        <div className={`${className} relative`}>
            <Button
                onClick={() => setIsVisible(false)}
                className="absolute top-1 right-1 text-error hover:text-error-dark transition-colors duration-200 p-1 z-10"
                aria-label="Close error display"
            >
                <CloseIcon className="w-4 h-4 text-error" />
            </Button>
            <div className="text-error">
                {title && (
                    <Paragraph className="text-md mb-2 font-bold">
                        {title}
                    </Paragraph>
                )}
                <div className="text-sm">
                    {(() => {
                        const allMessages = Object.entries(page.props.errorBags.default).flatMap(
                            ([key, messages]) => Array.isArray(messages) ? messages : [messages]
                        );
                        const hasMultipleErrors = allMessages.length > 1;

                        return Object.entries(page.props.errorBags.default).map(
                            ([key, messages]) => (
                                <div key={key} className="mb-1">
                                    {Array.isArray(messages) ? (
                                        messages.map((message, index) => (
                                            <Paragraph
                                                key={index}
                                                className="text-sm"
                                            >
                                                {hasMultipleErrors ? `- ${translateMessage(String(message))}` : translateMessage(String(message))}
                                            </Paragraph>
                                        ))
                                    ) : (
                                        <Paragraph className="text-sm">
                                            {hasMultipleErrors ? `- ${translateMessage(String(messages))}` : translateMessage(String(messages))}
                                        </Paragraph>
                                    )}
                                </div>
                            ),
                        );
                    })()}
                </div>
            </div>
        </div>
        </div>
    );
};

export default ErrorDisplay;
