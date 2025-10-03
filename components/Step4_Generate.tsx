

import React, { useMemo } from 'react';
import type { MQConfig } from '../types';
import { generateMQYaml, generateVerificationCommands } from '../services/yamlGenerator';
import { generateCcdtJson } from '../services/ccdtGenerator';
import WizardStep from './WizardStep';
import DownloadableCodeBlock from './DownloadableCodeBlock';

interface Step4Props {
  config: MQConfig;
  startOver: () => void;
  prevStep: () => void;
}

const Step4Generate: React.FC<Step4Props> = ({ config, startOver, prevStep }) => {
  const deploymentYaml = useMemo(() => generateMQYaml(config), [config]);
  const verificationCommands = useMemo(() => generateVerificationCommands(config), [config]);
  const ccdtJson = useMemo(() => generateCcdtJson(config), [config]);

  return (
    <WizardStep
      title="Step 4: Generate & Verify"
      description="Your configuration is complete. Use the generated YAML to deploy your Queue Manager and the commands to verify its status."
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">1. Deployment YAML</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Apply this YAML file to your OpenShift cluster using <code>oc apply -f mq-native-ha.yaml</code>.
          </p>
          <DownloadableCodeBlock
            content={deploymentYaml}
            filename={`${config.queueManagerName}-native-ha.yaml`}
            language="yaml"
          />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">2. Verification Commands</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Run these commands in your terminal to monitor the deployment status.
          </p>
          <DownloadableCodeBlock
            content={verificationCommands}
            filename="verify-mq-deployment.sh"
            language="shell"
          />
        </div>

        <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">3. Sample Client CCDT</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              This is a sample CCDT file for connecting an MQ client. You will need to create an OpenShift Route for the MQ listener (port 1414) and replace the placeholder hostname.
            </p>
            <DownloadableCodeBlock 
                content={ccdtJson} 
                filename="ccdt.json" 
                language="json" 
            />
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <button
          onClick={prevStep}
          className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Previous
        </button>
        <button
          onClick={startOver}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Start Over
        </button>
      </div>
    </WizardStep>
  );
};

export default Step4Generate;
