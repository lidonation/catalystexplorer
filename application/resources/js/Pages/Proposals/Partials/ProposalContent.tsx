import MinusIcon from '@/Components/svgs/MinusIcon';
import PlusIcon from '@/Components/svgs/PlusIcon';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface ProposalContentProps {
    content: string | any[] | null | undefined;
}

function normalizeMarkdown(text: string): string {
    if (!text) return '';

    return (
        text
            // Fix escaped characters
            .replace(/\\\./g, '.')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\[/g, '[')
            .replace(/\\\]/g, ']')
            .replace(/\\\-/g, '-')
            .replace(/\\_/g, '_')
            .replace(/\\\*/g, '*')
            // Remove extra spaces inside bold/italic markers
            .replace(/\*\*\s*(.*?)\s*\*\*/g, '**$1**')
            .replace(/\*\s*(.*?)\s*\*/g, '*$1*')
            // Normalize line breaks
            .replace(/\r\n/g, '\n')
            // Remove redundant backslashes before normal characters
            .replace(/\\(?=[A-Za-z0-9])/g, '')
    );
}

const ProposalContent = ({ content }: ProposalContentProps) => {
    const [expanded, setExpanded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const MAX_HEIGHT = 580;

    const formatHeader = (text: string) => {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .toUpperCase();
    };

    const parseContent = () => {
        if (!content) return [];

        let contentText: string;

        if (typeof content === 'string') {
            try {
                contentText = content;
            } catch (e) {
                contentText = content;
            }
        } else if (Array.isArray(content)) {
            contentText = content
                .map((item) => {
                    if (typeof item === 'string') return item;
                    if (item && typeof item === 'object') {
                        return JSON.stringify(item);
                    }
                    return String(item);
                })
                .join('\n\n');
        } else if (content && typeof content === 'object') {
            contentText = JSON.stringify(content);
        } else {
            contentText = String(content);
        }

        return parseProposalSections(contentText);
    };

    const parseProposalSections = (text: string) => {
        const sectionRegex = /###\s*\\\[(.*?)\\\](.*?)(?=###\s*\\\[|$)/gs;
        const sections = [];
        let match;

        while ((match = sectionRegex.exec(text)) !== null) {
            sections.push({
                header: match[1].trim(),
                content: match[2].trim(),
            });
        }

        if (sections.length === 0 && text.trim()) {
            sections.push({
                header: 'Overview',
                content: text.trim(),
            });
        }

        return sections;
    };

    useEffect(() => {
        if (contentRef.current) {
            setHasOverflow(contentRef.current.scrollHeight > MAX_HEIGHT);
        }
    }, [content]);

    const sections = parseContent();

    return (
        <div className="bg-background my-4 overflow-hidden rounded-xl p-6 shadow-sm">
            <div
                ref={contentRef}
                className={`relative ${!expanded && hasOverflow ? 'overflow-hidden' : ''}`}
                style={{
                    maxHeight:
                        !expanded && hasOverflow ? `${MAX_HEIGHT}px` : 'none',
                }}
            >
                {sections.map((section, index) => (
                    <div key={index} className="mb-8">
                        <h2 className="text-content mb-4 text-lg font-semibold">
                            {formatHeader(section.header)}
                        </h2>

                        <div className="prose max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    p: ({ node, ...props }) => (
                                        <p
                                            className="text-content my-3 leading-relaxed"
                                            {...props}
                                        />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul
                                            className="my-4 list-disc space-y-1 pl-6"
                                            {...props}
                                        />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol
                                            className="my-4 list-decimal space-y-1 pl-6"
                                            {...props}
                                        />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li className="mb-1" {...props} />
                                    ),
                                    h1: ({ node, ...props }) => (
                                        <h1
                                            className="mt-8 mb-4 text-3xl font-bold"
                                            {...props}
                                        />
                                    ),
                                    h2: ({ node, ...props }) => (
                                        <h2
                                            className="mt-6 mb-3 text-2xl font-semibold"
                                            {...props}
                                        />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3
                                            className="mt-5 mb-2 text-xl font-semibold"
                                            {...props}
                                        />
                                    ),
                                    strong: ({ node, ...props }) => (
                                        <strong
                                            className="font-bold"
                                            {...props}
                                        />
                                    ),
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote
                                            className="border-primary text-muted-foreground my-4 border-l-4 pl-4 italic"
                                            {...props}
                                        />
                                    ),
                                    img: ({ node, ...props }) => (
                                        <img
                                            className="my-4 max-w-full rounded-xl shadow-md"
                                            loading="lazy"
                                            alt={props.alt ?? ''}
                                            {...props}
                                        />
                                    ),
                                    a: ({ node, ...props }) => (
                                        <a
                                            className="text-blue-600 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            {...props}
                                        />
                                    ),
                                }}
                            >
                                {normalizeMarkdown(section.content)}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {!expanded && hasOverflow && (
                    <div className="from-background absolute right-0 bottom-0 left-0 h-10 bg-gradient-to-t to-transparent backdrop-blur-sm"></div>
                )}
            </div>

            {hasOverflow && (
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center justify-center"
                        aria-label={
                            expanded ? 'Show less content' : 'Show more content'
                        }
                    >
                        {expanded ? <MinusIcon /> : <PlusIcon />}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProposalContent;
