
import React from 'react';
import type { MQConfig } from '../types';
import { supportedCipherSpecs } from '../types';
import WizardStep from './WizardStep';

interface Step2Props {
  config: MQConfig;
  updateConfig: (newConfig: Partial<MQConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
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

const RadioGroup: React.FC<{
    label: string;
    options: { value: MQConfig['availability']; label: string; description: string }[];
    selectedValue: MQConfig['availability'];
    onChange: (value: MQConfig['availability']) => void;
}> = ({ label, options, selectedValue, onChange }) => (
    <fieldset>
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</legend>
        <div className="mt-2 space-y-4">
            {options.map((option) => (
                <div key={option.value} className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id={option.value}
                            name="availability"
                            type="radio"
                            checked={selectedValue === option.value}
                            onChange={() => onChange(option.value)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor={option.value} className="font-medium text-gray-900 dark:text-gray-100">
                            {option.label}
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">{option.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </fieldset>
);

const Step2Configuration: React.FC<Step2Props> = ({ config, updateConfig, nextStep, prevStep }) => {
    const isNextDisabled = !config.availability || !config.storageClassName || !config.channelName || (config.createAdminQueue && !config.adminQueueName) || (config.createSampleQueue && !config.sampleQueueName) || config.caValidityDays <= 0 || config.certValidityDays <=0;
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Allow empty input but store 0, otherwise parse as integer
        const numericValue = value === '' ? 0 : parseInt(value, 10);
        if (!isNaN(numericValue)) {
            updateConfig({ [name]: numericValue });
        }
    };

    return (
        <WizardStep title="Step 2: Configuration" description="Configure the availability and storage for your Queue Manager.">
            <RadioGroup
                label="Availability Mode"
                selectedValue={config.availability}
                onChange={(value) => updateConfig({ availability: value })}
                options={[
                    { value: 'NativeHA', label: 'Native HA', description: 'A highly available, active/active/active deployment with three pods.' },
                    { value: 'SingleInstance', label: 'Single Instance', description: 'A single pod deployment suitable for development and testing.' }
                ]}
            />

            <div>
                <label htmlFor="licenseUse" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    License Use
                </label>
                <select
                    id="licenseUse"
                    name="licenseUse"
                    value={config.licenseUse}
                    onChange={(e) => updateConfig({ licenseUse: e.target.value as MQConfig['licenseUse'] })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="NonProduction">NonProduction</option>
                    <option value="Production">Production</option>
                </select>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Select the license entitlement. Ensure you have the appropriate license for Production use.
                </p>
            </div>

            <div>
                <div className="flex items-center">
                    <label htmlFor="storageClassName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Storage Class Name
                    </label>
                    <InfoTooltip text="Default: ocs-storagecluster-cephfs" />
                </div>
                <div className="mt-1">
                    <input
                        type="text"
                        name="storageClassName"
                        id="storageClassName"
                        value={config.storageClassName}
                        onChange={(e) => updateConfig({ storageClassName: e.target.value })}
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., ocs-storagecluster-cephfs"
                    />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    The name of the StorageClass to use for persistent storage. It must support ReadWriteMany (RWX) access mode.
                </p>
            </div>
            
            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">TLS Generation Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <div className="flex items-center">
                            <label htmlFor="caValidityDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                CA Validity (days)
                            </label>
                            <InfoTooltip text="Default: 3650" />
                        </div>
                        <input
                            type="number"
                            name="caValidityDays"
                            id="caValidityDays"
                            value={config.caValidityDays}
                            onChange={handleNumberChange}
                            min="1"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                         <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Lifetime of the root Certificate Authority in days. Defaults to 3650 (10 years).
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center">
                            <label htmlFor="certValidityDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                               Server Certificate Validity (days)
                            </label>
                             <InfoTooltip text="Default: 90" />
                        </div>
                        <input
                            type="number"
                            name="certValidityDays"
                            id="certValidityDays"
                            value={config.certValidityDays}
                            onChange={handleNumberChange}
                            min="1"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Lifetime of the QM and HA certificates.
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Client Connection</h3>
                 <div>
                    <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
                        SVRCONN Channel Name
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="channelName"
                            id="channelName"
                            value={config.channelName}
                            onChange={(e) => updateConfig({ channelName: e.target.value })}
                            className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g., CLOUD.APP.SVRCONN"
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        The name of the server-connection channel for clients. This will be created automatically.
                    </p>
                </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Initial Resources</h3>
                <div className="mt-4">
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="createSampleQueue"
                                name="createSampleQueue"
                                type="checkbox"
                                checked={config.createSampleQueue}
                                onChange={(e) => updateConfig({ createSampleQueue: e.target.checked })}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="createSampleQueue" className="font-medium text-gray-700 dark:text-gray-300">
                                Create a sample queue
                            </label>
                            <p className="text-gray-500 dark:text-gray-400">Creates a sample queue for testing purposes.</p>
                        </div>
                    </div>
                    {config.createSampleQueue && (
                        <div className="mt-4 pl-8">
                            <label htmlFor="sampleQueueName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sample Queue Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="sampleQueueName"
                                    id="sampleQueueName"
                                    value={config.sampleQueueName}
                                    onChange={(e) => updateConfig({ sampleQueueName: e.target.value })}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="createAdminQueue"
                                name="createAdminQueue"
                                type="checkbox"
                                checked={config.createAdminQueue}
                                onChange={(e) => updateConfig({ createAdminQueue: e.target.checked })}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="createAdminQueue" className="font-medium text-gray-700 dark:text-gray-300">
                                Create an administrative queue
                            </label>
                            <p className="text-gray-500 dark:text-gray-400">Creates a queue for administrative commands.</p>
                        </div>
                    </div>
                    {config.createAdminQueue && (
                        <div className="mt-4 pl-8">
                            <label htmlFor="adminQueueName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Admin Queue Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="adminQueueName"
                                    id="adminQueueName"
                                    value={config.adminQueueName}
                                    onChange={(e) => updateConfig({ adminQueueName: e.target.value })}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {config.availability === 'NativeHA' && (
              <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">TLS Configuration</h3>
                <div className="mt-4">
                  <label htmlFor="haCipherSpec" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Native HA CipherSpec
                  </label>
                  <select
                    id="haCipherSpec"
                    name="haCipherSpec"
                    value={config.haCipherSpec}
                    onChange={(e) => updateConfig({ haCipherSpec: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {supportedCipherSpecs.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    The TLS cipher specification for securing communication between Native HA instances. This will also be used for the client channel.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
                <button
                    onClick={prevStep}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Previous
                </button>
                <button
                    onClick={nextStep}
                    disabled={isNextDisabled}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Next: TLS Certificates
                </button>
            </div>
        </WizardStep>
    );
};

export default Step2Configuration;
