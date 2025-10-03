

import React, { useState } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';
import DownloadIcon from './icons/DownloadIcon';

interface DownloadableCodeBlockProps {
  content: string;
  filename: string;
  language: string;
}

const DownloadableCodeBlock: React.FC<DownloadableCodeBlockProps> = ({ content, filename, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-gray-900 dark:bg-black rounded-lg overflow-hidden my-4 shadow-md">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 dark:bg-gray-700">
        <span className="text-sm font-semibold text-gray-300 dark:text-gray-400">{language}</span>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCopy}
            className="flex items-center text-gray-300 hover:text-white focus:outline-none transition-colors"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <>
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span className="ml-2 text-xs text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <ClipboardIcon className="w-5 h-5" />
                <span className="ml-2 text-xs">Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center text-gray-300 hover:text-white focus:outline-none transition-colors"
            aria-label={`Download ${filename}`}
          >
            <DownloadIcon className="w-5 h-5" />
            <span className="ml-2 text-xs">Download</span>
          </button>
        </div>
      </div>
      <pre className="p-4 text-sm text-white overflow-x-auto">
        <code>
          {content}
        </code>
      </pre>
    </div>
  );
};

export default DownloadableCodeBlock;
