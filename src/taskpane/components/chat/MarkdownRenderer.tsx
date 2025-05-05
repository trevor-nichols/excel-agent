/**
 * File: src/taskpane/components/chat/MarkdownRenderer.tsx
 * Renders markdown content for chat messages
 * Dependencies: React, react-markdown
 * Used by: MessageItem component
 */

import * as React from "react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import "./styles/chat.css";

// Component for rendering code blocks with syntax highlighting
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match && match[1] ? match[1] : 'javascript';
  
  return !inline ? (
    <SyntaxHighlighter
      style={tomorrow}
      language={language}
      PreTag="div"
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

interface MarkdownRendererProps {
  children: string;
  worksheetNames?: string[];
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children, worksheetNames = [] }) => {
  // Ensure children is a string
  const markdownContent = typeof children === 'string' ? children : String(children);
  
  // Process content to highlight worksheet mentions if worksheetNames are provided
  const processedContent = React.useMemo(() => {
    if (!worksheetNames || worksheetNames.length === 0) {
      return markdownContent;
    }
    
    // Create a copy of the content to work with
    let processedText = markdownContent;
    
    // Replace worksheet mentions with highlighted versions
    // This approach preserves the original text for markdown processing
    // while adding special markers that can be styled with CSS
    worksheetNames.forEach(name => {
      const regex = new RegExp(`@${name}\\b`, 'g');
      processedText = processedText.replace(regex, `**@${name}**`);
    });
    
    return processedText;
  }, [markdownContent, worksheetNames]);
  
  return (
    <div className="markdown-container">
      <ReactMarkdown
        components={{
          code: CodeBlock,
          a: ({ node, children, ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          table: ({ node, children, ...props }) => (
            <div className="table-container">
              <table {...props}>{children}</table>
            </div>
          ),
          strong: ({ node, children, ...props }) => {
            // Check if this is a worksheet mention
            const text = String(children);
            if (text.startsWith('@') && worksheetNames.some(name => text === `@${name}`)) {
              return (
                <span className="worksheet-mention" {...props}>
                  {children}
                </span>
              );
            }
            return <strong {...props}>{children}</strong>;
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 