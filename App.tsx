
import React, { useState, useCallback } from 'react';
import type { MQConfig } from './types';
import { generateTlsData } from './services/pkiGenerator';

import ProgressBar from './components/ProgressBar';
import Step1Details from './components/Step1_Details';
import Step2Configuration from './components/Step2_Configuration';
import Step3Tls from './components/Step3_TLS';
import Step4Generate from './components/Step4_Generate';

const TOTAL_STEPS = 4;

const initialConfig: MQConfig = {
  queueManagerName: 'HAQM1',
  namespace: 'mq',
  availability: 'NativeHA',
  storageClassName: 'ocs-storagecluster-cephfs',
  licenseUse: 'NonProduction',
  caValidityDays: 3650, // Default: 10 years
  certValidityDays: 90,
  haCipherSpec: 'ANY_TLS12_OR_HIGHER',
  channelName: 'CLOUD.APP.SVRCONN',
  createSampleQueue: true,
  sampleQueueName: 'DEV.QUEUE.1',
  createAdminQueue: false,
  adminQueueName: 'SYSTEM.ADMIN.COMMAND.QUEUE',
};


function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<MQConfig>(initialConfig);

  const updateConfig = useCallback((newConfig: Partial<MQConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      if (currentStep === 2) {
        // Generate TLS data when moving from step 2 to 3
        const tlsData = generateTlsData(config);
        updateConfig({ tls: tlsData });
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const startOver = () => {
    setConfig(initialConfig);
    setCurrentStep(1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Details config={config} updateConfig={updateConfig} nextStep={nextStep} />;
      case 2:
        return <Step2Configuration config={config} updateConfig={updateConfig} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <Step3Tls config={config} nextStep={nextStep} prevStep={prevStep} />;
      case 4:
        return <Step4Generate config={config} startOver={startOver} prevStep={prevStep} />;
      default:
        return <Step1Details config={config} updateConfig={updateConfig} nextStep={nextStep} />;
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
            IBM MQ Native HA YAML Generator
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">A wizard to help you generate deployment configurations for MQ on OpenShift.</p>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            <div className="mt-12">
              {renderStep()}
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Built for educational purposes. Always review generated configurations before production use.</p>
      </footer>
    </div>
  );
}

export default App;