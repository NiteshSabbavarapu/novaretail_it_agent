import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';

/**
 * Cleanly renders Markdown responses from the assistant.
 * Prevents raw Markdown symbols (**, ###, |, etc.) from leaking.
 * Filters out raw JSON tool dumps if any occur.
 * Safe, sanitized, and styled with Tailwind typography.
 */
export default function MarkdownMessage({ content }) {
  if (!content) return null;

  // Sanitize: If response starts with raw JSON object or array, extract readable message or format
  let cleanContent = String(content).trim();

  if (cleanContent.startsWith('{') && cleanContent.endsWith('}')) {
    try {
      const parsed = JSON.parse(cleanContent);
      if (parsed.answer) {
        cleanContent = parsed.answer;
      } else if (parsed.message) {
        cleanContent = parsed.message;
      } else if (parsed.error) {
        cleanContent = `Error: ${parsed.error}`;
      }
    } catch (e) {
      // not JSON, keep as is
    }
  }

  return (
    <div className="prose prose-invert max-w-none text-xs leading-relaxed text-dark-200 select-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed font-sans text-xs text-dark-200">
              {children}
            </p>
          ),
          // Headings
          h1: ({ children }) => (
            <h1 className="text-sm font-semibold font-mono text-dark-100 mt-3 mb-1.5 first:mt-0 pb-1 border-b border-dark-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-semibold font-mono text-dark-100 mt-2.5 mb-1 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-medium font-mono text-dark-200 mt-2 mb-1 first:mt-0">
              {children}
            </h3>
          ),
          // Bold & Italics
          strong: ({ children }) => (
            <strong className="font-semibold text-dark-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-dark-300">{children}</em>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 mb-2.5 space-y-1 text-xs text-dark-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 mb-2.5 space-y-1 text-xs text-dark-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">{children}</li>
          ),
          // Code & Code Blocks
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-dark-950 border border-dark-750 text-brand-purple font-mono text-[11px] font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="my-2.5 rounded-lg bg-dark-950 border border-dark-800 p-3 font-mono text-[11px] overflow-x-auto text-dark-200 shadow-inner">
                <code className="text-dark-200 font-mono" {...props}>
                  {children}
                </code>
              </div>
            );
          },
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue hover:text-brand-purple underline transition-colors inline-flex items-center gap-0.5 font-mono text-[11px]"
            >
              <span>{children}</span>
              <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
            </a>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-brand-purple/60 pl-3 py-0.5 my-2 italic text-dark-400 text-xs bg-dark-950/40 rounded-r">
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-dark-750">
              <table className="min-w-full divide-y divide-dark-750 text-xs text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-dark-950 font-mono text-dark-300">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-dark-800 bg-dark-900/60 font-sans">
              {children}
            </tbody>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-[11px] font-semibold text-dark-200 tracking-wider font-mono uppercase">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-xs text-dark-300">
              {children}
            </td>
          ),
          hr: () => <hr className="my-3 border-dark-800" />,
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}

