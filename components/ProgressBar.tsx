import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  'Queue Manager Details',
  'Configuration',
  'TLS Certificates',
  'Generate & Verify',
];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center text-center w-1/4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-300 dark:ring-blue-500' : ''}
                    ${!isCompleted && !isActive ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300' : ''}
                  `}
                >
                  {isCompleted ? (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : stepNumber}
                </div>
                <p className={`mt-2 text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>{step}</p>
              </div>
              {stepNumber < totalSteps && (
                <div className={`flex-auto border-t-4 transition-colors duration-300 ${isCompleted ? 'border-green-500' : 'border-gray-200 dark:border-gray-600'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
