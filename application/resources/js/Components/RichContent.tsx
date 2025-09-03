import { defaultSchema } from 'hast-util-sanitize';
import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RichContentProps {
    content?: string;
    format?: 'html' | 'markdown';
    className?: string;
}

const customSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames || []), 'ol', 'ul', 'li'],
};

const RichContent = forwardRef<HTMLDivElement, RichContentProps>(
    ({ content, format = 'html', className = '' }, ref) => {
        return (
            <div ref={ref} className={`${className} steps-list-wrapper`}>
                {format === 'markdown' ? (
                    <ReactMarkdown remarkPlugins={[[remarkGfm]]}>
                        {content || ''}
                    </ReactMarkdown>
                ) : (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: content as string | TrustedHTML,
                        }}
                    />
                )}
            </div>
        );
    },
);

RichContent.displayName = 'RichContent';

export default RichContent;
