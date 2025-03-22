import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

interface RichContentProps {
    content?: string;
    format?: 'html' | 'markdown';
    className?: string;
}

const RichContent: React.FC<RichContentProps> = ({
    content,
    format = 'html',
    className = '',
}) => {
    return (
        <div className={`rich-content ${className}`}>
            {format === 'markdown' ? (
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {content}
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
};

export default RichContent;
