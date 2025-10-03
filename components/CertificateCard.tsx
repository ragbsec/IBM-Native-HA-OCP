import React, { useState } from 'react';
import DownloadIcon from './icons/DownloadIcon';
import CheckIcon from './icons/CheckIcon';

interface CertificateCardProps {
  title: string;
  certContent: string;
  certFilename: string;
  keyContent?: string;
  keyFilename?: string;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ title, certContent, certFilename, keyContent, keyFilename }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [certDownloaded, setCertDownloaded] = useState(false);
  const [keyDownloaded, setKeyDownloaded] = useState(false);

  const handleDownload = (content: string, filename: string, type: 'cert' | 'key') => {
    // A world-class engineer adds validation to prevent errors.
    if (!content) {
      console.error(`Download of ${filename} was attempted, but no content was available.`);
      return;
    }
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    if (type === 'cert') {
      setCertDownloaded(true);
      setTimeout(() => setCertDownloaded(false), 2000);
    } else {
      setKeyDownloaded(true);
      setTimeout(() => setKeyDownloaded(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-700/50 shadow-md rounded-lg overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700">
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
        <div className="flex items-center space-x-2">
           <button
             onClick={() => handleDownload(certContent, certFilename, 'cert')}
             className="flex items-center justify-center w-28 px-3 py-1.5 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-75"
             title={`Download ${certFilename}`}
             disabled={certDownloaded}
           >
             {certDownloaded ? (
               <span className="flex items-center text-green-600 dark:text-green-400">
                 <CheckIcon className="w-4 h-4 mr-2" />
                 Downloaded!
               </span>
             ) : (
               <span className="flex items-center">
                 <DownloadIcon className="w-4 h-4 mr-2" />
                 Cert
               </span>
             )}
           </button>
           {keyContent && keyFilename && (
             <button
               onClick={() => handleDownload(keyContent, keyFilename, 'key')}
               className="flex items-center justify-center w-28 px-3 py-1.5 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-75"
               title={`Download ${keyFilename}`}
               disabled={keyDownloaded}
             >
               {keyDownloaded ? (
                 <span className="flex items-center text-green-600 dark:text-green-400">
                   <CheckIcon className="w-4 h-4 mr-2" />
                   Downloaded!
                 </span>
               ) : (
                 <span className="flex items-center">
                   <DownloadIcon className="w-4 h-4 mr-2" />
                   Key
                 </span>
               )}
             </button>
           )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none ml-2"
          >
            {isExpanded ? 'Hide' : 'Show'} PEM
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Certificate ({certFilename})</h4>
          <pre className="p-2 bg-gray-900 text-white rounded-md text-xs overflow-x-auto max-h-40">
            <code>{certContent}</code>
          </pre>
          {keyContent && keyFilename && (
            <>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">Private Key ({keyFilename})</h4>
              <pre className="p-2 bg-gray-900 text-white rounded-md text-xs overflow-x-auto max-h-40">
                <code>{keyContent}</code>
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateCard;