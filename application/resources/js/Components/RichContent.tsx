import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

interface RichContentProps {
  content?: string;
  format?: 'html' | 'markdown';
  className?: string;
}

const RichContent = forwardRef<HTMLDivElement, RichContentProps>(
  ({ content, format = 'html', className = '' }, ref) => {
    return (
      <div ref={ref} className={className}>
        {format === 'markdown' ? (
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
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
  }
);

// Optional but good for debugging in DevTools
RichContent.displayName = 'RichContent';

export default RichContent;

