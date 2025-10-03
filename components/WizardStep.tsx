
import React from 'react';

interface WizardStepProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const WizardStep: React.FC<WizardStepProps> = ({ title, description, children }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
      <div className="mt-8 space-y-6">
        {children}
      </div>
    </div>
  );
};

export default WizardStep;
