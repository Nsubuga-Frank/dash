import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * A component that renders markdown content with syntax highlighting for code blocks
 */
const Markdown = ({ children }) => {
  return (
    <div className="markdown-content text-sm whitespace-pre-wrap">
      <ReactMarkdown
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative group">
                <SyntaxHighlighter
                  style={tomorrow}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-md"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={`${className} font-mono px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800`} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <pre className="rounded-md overflow-auto">{children}</pre>;
          },
          p({ children }) {
            return <p className="mb-4">{children}</p>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc ml-5 mb-4">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal ml-5 mb-4">{children}</ol>;
          },
          li({ children }) {
            return <li className="mb-1">{children}</li>;
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4">{children}</blockquote>;
          },
          table({ children }) {
            return <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 my-4">{children}</table>;
          },
          thead({ children }) {
            return <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-gray-200 dark:divide-gray-800">{children}</tbody>;
          },
          tr({ children }) {
            return <tr>{children}</tr>;
          },
          th({ children }) {
            return <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">{children}</th>;
          },
          td({ children }) {
            return <td className="px-3 py-2 whitespace-nowrap">{children}</td>;
          },
          a({ children, href }) {
            return <a className="text-blue-500 hover:text-blue-700 underline" href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
          }
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

Markdown.propTypes = {
  children: PropTypes.string.isRequired
};

export default Markdown; 