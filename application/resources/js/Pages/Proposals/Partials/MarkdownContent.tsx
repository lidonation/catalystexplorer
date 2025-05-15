import { useCallback, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/Components/atoms/Button";
import PlusIcon from "@/Components/svgs/PlusIcon";
import MinusIcon from "@/Components/svgs/MinusIcon";
import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
    content: Array<any> | string | null | undefined;
}

const MarkdownContent = ({ content }: MarkdownContentProps) => {
    const { t } = useTranslation();
    const [isContentExpanded, setIsContentExpanded] = useState(false);
    const [isContentTruncated, setIsContentTruncated] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const toggleContentExpand = useCallback(() => {
        setIsContentExpanded(prev => !prev);
    }, []);

    const getMarkdownContent = useCallback((content: Array<any> | string | null | undefined): string => {
        if (typeof content === 'string') {
            return content;
        } else if (Array.isArray(content)) {
            return content.map(item => {
                if (typeof item === 'string') {
                    return item;
                } else if (typeof item === 'object' && item !== null) {
                    if (item.text) {
                        return item.text;
                    } else if (item.content) {
                        return item.content;
                    } else {
                        return Object.entries(item)
                            .map(([key, value]) => `**${key}**: ${value}`)
                            .join('\n');
                    }
                }
                return String(item);
            }).join('\n\n');
        }
        return '';
    }, []);

    useEffect(() => {
        const checkIfContentIsTruncated = () => {
            if (contentRef.current) {
                const { scrollHeight, clientHeight } = contentRef.current;
                setIsContentTruncated(scrollHeight > clientHeight);
            }
        };

        checkIfContentIsTruncated();
        window.addEventListener('resize', checkIfContentIsTruncated);

        return () => {
            window.removeEventListener('resize', checkIfContentIsTruncated);
        };
    }, [content]);

    return (
        <div className="self-stretch p-6 bg-background rounded-xl shadow-[0px_1px_4px_0px_rgba(16,24,40,0.10)] flex flex-col items-start gap-4 mt-4 mb-4 relative">
            <div 
                ref={contentRef}
                className={`w-full overflow-hidden transition-all duration-300 ${isContentExpanded ? 'max-h-full' : 'max-h-140'}`}
            >
                <ReactMarkdown>
                    {getMarkdownContent(content)}
                </ReactMarkdown>
            </div>
            
            {!isContentExpanded && isContentTruncated && (
                <div className="absolute bottom-0 left-0 right-0 h-16 backdrop-blur-sm bg-background/30 pointer-events-none flex items-center justify-center" />
            )}
            
            {isContentTruncated && (
                <div className='absolute bottom-4 left-0 right-0 flex items-center justify-center z-10'>
                    <Button 
                        onClick={toggleContentExpand}
                        className="shadow-md p-2 rounded-full"
                        aria-label={isContentExpanded ? t('common.collapse') : t('common.expand')}
                    >
                        {isContentExpanded ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MarkdownContent;
