import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";
import PlusIcon from "@/Components/svgs/PlusIcon";
import MinusIcon from "@/Components/svgs/MinusIcon";

interface ProposalContentProps {
  content: string | any[] | null | undefined;
}

const ProposalContent = ({ content }: ProposalContentProps) => {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const MAX_HEIGHT = 430;
  
  const formatHeader = (text: string) => {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .toUpperCase();
  };
  
  const parseContent = () => {
    if (!content) return [];
    
    let contentText: string;
    
    if (typeof content === "string") {
      try {
        contentText = content;
      } catch (e) {
        contentText = content;
      }
    } else if (Array.isArray(content)) {
      contentText = content.map(item => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return JSON.stringify(item);
        }
        return String(item);
      }).join("\n\n");
    } else if (content && typeof content === "object") {
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
        content: match[2].trim()
      });
    }
    
    if (sections.length === 0 && text.trim()) {
      sections.push({
        header: "Overview",
        content: text.trim()
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
    <div className="bg-background rounded-xl shadow-sm overflow-hidden my-4 p-6">
      <div 
        ref={contentRef}
        className={`relative ${!expanded && hasOverflow ? 'overflow-hidden' : ''}`}
        style={{ maxHeight: (!expanded && hasOverflow) ? `${MAX_HEIGHT}px` : 'none' }}
      >
        {sections.map((section, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-lg font-semibold text-content mb-4">
              {formatHeader(section.header)}
            </h2>
            
            <div className="prose max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p className="my-3 text-content" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 my-4" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-5 my-4" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-2" {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold mt-5 mb-3" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-bold mt-4 mb-2" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote {...props} />
                  ),
                }}
              >
                {section.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        
        {!expanded && hasOverflow && (
          <div className="absolute bottom-0 left-0 right-0 h-10 backdrop-blur-sm bg-gradient-to-t from-background to-transparent"></div>
        )}
      </div>
      
      {hasOverflow && (
        <div className="mt-4 flex justify-center">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="flex items-center justify-center"
            aria-label={expanded ? "Show less content" : "Show more content"}
          >
            {expanded ? <MinusIcon /> : <PlusIcon />}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProposalContent;
