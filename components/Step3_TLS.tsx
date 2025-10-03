
import React, { useState, useEffect } from 'react';
import type { MQConfig } from '../types';
import WizardStep from './WizardStep';
import CertificateCard from './CertificateCard';
import forge from 'node-forge';

interface Step3Props {
  config: MQConfig;
  nextStep: () => void;
  prevStep: () => void;
}

const Step3Tls: React.FC<Step3Props> = ({ config, nextStep, prevStep }) => {
  const { tls, availability, queueManagerName, namespace } = config;
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!tls) {
      setValidationError('TLS data has not been generated. Please go back to the previous step.');
      return;
    }

    // Reset error state initially
    setValidationError(null);

    // 1. Validate the Certificate Authority
    try {
      forge.pki.certificateFromPem(tls.ca);
    } catch (error) {
      console.error("CA Certificate validation failed:", error);
      setValidationError(`Validation Error: The Root CA Certificate (ca.pem) appears to be malformed. Please ensure it is a valid PEM-encoded certificate. Regenerating certificates by returning to the previous step may resolve this.`);
      return;
    }

    // 2. Validate the Queue Manager (Server) certificate and its SANs
    try {
      const qmCert = forge.pki.certificateFromPem(tls.cert);
      const qmSanExtension = qmCert.getExtension('subjectAltName');
      
      if (!qmSanExtension) {
          setValidationError('Validation Error: The Queue Manager Certificate is missing the required Subject Alternative Name (SAN) extension. This is needed for service identification.');
          return;
      }

      const qmSans = qmSanExtension.altNames.map(name => name.value);
      const expectedQmSan = `${queueManagerName}.${namespace}.svc.cluster.local`;
      if (!qmSans.includes(expectedQmSan)) {
          setValidationError(`Validation Error: The Queue Manager Certificate's SAN is missing the expected DNS name: '${expectedQmSan}'. Please return to Step 1 to verify the Queue Manager Name and Namespace.`);
          return;
      }
    } catch (error) {
      console.error("QM Certificate validation failed:", error);
      setValidationError(`Validation Error: The Queue Manager Certificate (qmgr.pem) appears to be malformed. Please ensure it is a valid PEM-encoded certificate. Regenerating certificates by returning to the previous step may resolve this.`);
      return;
    }
    
    // 3. Validate the Queue Manager (Server) private key
    try {
      forge.pki.privateKeyFromPem(tls.key);
    } catch (error) {
      console.error("QM Key validation failed:", error);
      setValidationError(`Validation Error: The Queue Manager Private Key (qmgr.key) appears to be malformed. Please ensure it is a valid PEM-encoded private key. Regenerating keys by returning to the previous step may resolve this.`);
      return;
    }

    // 4. Conditionally validate Native HA assets
    if (availability === 'NativeHA') {
      try {
        const haCert = forge.pki.certificateFromPem(tls.haCert);
        const haSanExtension = haCert.getExtension('subjectAltName');

        if (!haSanExtension) {
            setValidationError('Validation Error: The Native HA Certificate is missing the required Subject Alternative Name (SAN) extension. This is needed for service identification.');
            return;
        }

        const haSans = haSanExtension.altNames.map(name => name.value);
        const expectedHaSan = `${queueManagerName}-ha.${namespace}.svc.cluster.local`;
        if (!haSans.includes(expectedHaSan)) {
            setValidationError(`Validation Error: The Native HA Certificate's SAN is missing the expected DNS name: '${expectedHaSan}'. Please return to Step 1 to verify the Queue Manager Name and Namespace.`);
            return;
        }
      } catch (error) {
        console.error("HA Certificate validation failed:", error);
        setValidationError(`Validation Error: The Native HA Certificate (ha.pem) appears to be malformed. Please ensure it is a valid PEM-encoded certificate. Regenerating certificates by returning to the previous step may resolve this.`);
        return;
      }
      try {
        forge.pki.privateKeyFromPem(tls.haKey);
      } catch (error) {
        console.error("HA Key validation failed:", error);
        setValidationError(`Validation Error: The Native HA Private Key (ha.key) appears to be malformed. Please ensure it is a valid PEM-encoded private key. Regenerating keys by returning to the previous step may resolve this.`);
        return;
      }
    }
  }, [tls, availability, queueManagerName, namespace]);


  return (
    <WizardStep
      title="Step 3: TLS Certificates"
      description="Self-signed TLS certificates have been generated. Download them for your records or for use with external truststores. You can also expand each section to view the PEM content."
    >
      {validationError && (
        <div className="text-center p-4 border border-red-500 bg-red-50 dark:bg-red-900/20 rounded-md mb-6 animate-fade-in">
          <p className="font-bold text-red-800 dark:text-red-200">Validation Error</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{validationError}</p>
        </div>
      )}

      {!tls ? (
        <div className="text-center p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-yellow-700 dark:text-yellow-200">TLS data has not been generated. Please go back to the previous step.</p>
        </div>
      ) : (
        <div className="space-y-6">
            <CertificateCard
                title="Root Certificate Authority (CA)"
                certContent={tls.ca}
                certFilename="ca.pem"
            />
            <CertificateCard
                title="Queue Manager (for clients)"
                certContent={tls.cert}
                certFilename="qmgr.pem"
                keyContent={tls.key}
                keyFilename="qmgr.key"
            />
            {availability === 'NativeHA' && (
                <CertificateCard
                    title="Native HA Replication"
                    certContent={tls.haCert}
                    certFilename="ha.pem"
                    keyContent={tls.haKey}
                    keyFilename="ha.key"
                />
            )}
        </div>
      )}

      <div className="flex justify-between pt-8">
        <button
          onClick={prevStep}
          className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={!tls || !!validationError}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next: Generate &amp; Verify
        </button>
      </div>
    </WizardStep>
  );
};

export default Step3Tls;
