
import React from 'react';
import type { MQConfig } from '../types';
import WizardStep from './WizardStep';

interface Step1Props {
  config: MQConfig;
  updateConfig: (newConfig: Partial<MQConfig>) => void;
  nextStep: () => void;
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="relative flex items-center group ml-2">
      <button type="button" className="cursor-pointer" aria-label={`Info: ${text}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
      </button>
      <div 
        role="tooltip"
        className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
      >
        {text}
      </div>
    </div>
  );
};

// FIX: Constrained 'id' prop to only allow string keys of MQConfig, resolving type errors with form element attributes.
const InputField: React.FC<{
    label: string;
    id: Extract<keyof MQConfig, string>;
    value: string;
    placeholder: string;
    helpText: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tooltipText?: string;
}> = ({ label, id, value, placeholder, helpText, onChange, tooltipText }) => (
    <div>
        <div className="flex items-center">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            {tooltipText && <InfoTooltip text={tooltipText} />}
        </div>
        <div className="mt-1">
            <input
                type="text"
                name={id}
                id={id}
                value={value}
                onChange={onChange}
                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={placeholder}
            />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
    </div>
);


const Step1Details: React.FC<Step1Props> = ({ config, updateConfig, nextStep }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ [e.target.name]: e.target.value });
  };

  return (
    <WizardStep title="Step 1: Queue Manager Details" description="Provide the basic identification for your new Queue Manager deployment.">
      <InputField
        label="Queue Manager Name"
        id="queueManagerName"
        value={config.queueManagerName}
        onChange={handleInputChange}
        placeholder="e.g., HAQM1"
        helpText="The name of the QueueManager resource. Must be a valid DNS-1123 subdomain name."
        tooltipText="Default: HAQM1"
      />
      <InputField
        label="Namespace"
        id="namespace"
        value={config.namespace}
        onChange={handleInputChange}
        placeholder="e.g., mq"
        helpText="The OpenShift project (namespace) where the Queue Manager will be deployed."
        tooltipText="Default: mq"
      />
      <div className="flex justify-end pt-4">
        <button
          onClick={nextStep}
          disabled={!config.queueManagerName || !config.namespace}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next: Configuration
        </button>
      </div>
    </WizardStep>
  );
};

export default Step1Details;
