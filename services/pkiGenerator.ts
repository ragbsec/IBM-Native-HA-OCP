
import forge from 'node-forge';
import type { MQConfig } from '../types';

const pki = forge.pki;
const rsa = forge.pki.rsa;

// Default attributes for the certificate's distinguished name (DN)
const defaultAttrs = [
  { name: 'countryName', value: 'US' },
  { name: 'stateOrProvinceName', value: 'California' },
  { name: 'localityName', value: 'San Francisco' },
  { name: 'organizationName', value: 'IBM MQ Native HA Wizard' },
  { shortName: 'OU', value: 'Development' },
];

/**
 * Creates a new X.509 certificate and signs it with the provided CA.
 * @param commonName - The Common Name for the certificate subject.
 * @param subjectAltNames - An array of Subject Alternative Names (DNS names).
 * @param caCert - The CA certificate to sign this new cert.
 * @param caKey - The CA private key to sign this new cert.
 * @param validityDays - The number of days the certificate should be valid for.
 * @returns An object containing the new key pair and the signed certificate.
 */
const createCertificate = (
  commonName: string,
  subjectAltNames: string[],
  caCert: forge.pki.Certificate,
  caKey: forge.pki.PrivateKey,
  validityDays: number,
) => {
  const keys = rsa.generateKeyPair({ bits: 2048 });
  const cert = pki.createCertificate();
  
  cert.publicKey = keys.publicKey;
  // A more robust serial number generation is recommended for production systems
  cert.serialNumber = Math.floor(Math.random() * 100000).toString();
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + validityDays);

  const attrs = [...defaultAttrs, { name: 'commonName', value: commonName }];
  cert.setSubject(attrs);
  cert.setIssuer(caCert.subject.attributes);
  
  const altNames = subjectAltNames.map(name => ({ type: 2, value: name })); // type 2 is DNS

  cert.setExtensions([
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
    { name: 'extKeyUsage', serverAuth: true, clientAuth: true },
    { name: 'subjectAltName', altNames: altNames },
    { name: 'subjectKeyIdentifier' },
    { name: 'authorityKeyIdentifier', keyIdentifier: caCert.generateSubjectKeyIdentifier().getBytes() }
  ]);

  cert.sign(caKey, forge.md.sha256.create());
  
  return {
    key: keys.privateKey,
    cert: cert,
  };
};

export interface TlsData {
    ca: string;
    cert: string;
    key: string;
    haCert: string;
    haKey: string;
}

/**
 * Generates a full PKI structure for MQ Native HA including a self-signed CA.
 * @param config - The MQ configuration object.
 * @returns A TlsData object with PEM-encoded certificates and keys.
 */
export const generateTlsData = (config: MQConfig): TlsData => {
  const { queueManagerName, namespace, caValidityDays, certValidityDays } = config;

  // 1. Generate Root CA
  const caKeys = rsa.generateKeyPair({ bits: 2048 });
  const caCert = pki.createCertificate();
  caCert.publicKey = caKeys.publicKey;
  caCert.serialNumber = '01';
  caCert.validity.notBefore = new Date();
  caCert.validity.notAfter = new Date();
  // Use the user-configured validity period for the CA certificate.
  caCert.validity.notAfter.setDate(caCert.validity.notBefore.getDate() + caValidityDays);
  
  const caCommonName = `mq-ca.${namespace}.svc.cluster.local`;
  const caAttrs = [...defaultAttrs, { name: 'commonName', value: caCommonName }];
  caCert.setSubject(caAttrs);
  caCert.setIssuer(caAttrs); // Self-signed
  
  caCert.setExtensions([
    { name: 'basicConstraints', cA: true, pathLenConstraint: 1 },
    { name: 'keyUsage', keyCertSign: true, cRLSign: true },
    { name: 'subjectKeyIdentifier' }
  ]);
  
  caCert.sign(caKeys.privateKey, forge.md.sha256.create());

  // 2. Generate Queue Manager Certificate
  const qmgrCommonName = `${queueManagerName}.${namespace}.svc.cluster.local`;
  const qmgrAltNames = [
      qmgrCommonName,
      `${queueManagerName}.${namespace}.svc`,
      `${queueManagerName}`,
  ];
  const qmgr = createCertificate(qmgrCommonName, qmgrAltNames, caCert, caKeys.privateKey, certValidityDays);

  // 3. Generate Native HA Certificate
  const haCommonName = `${queueManagerName}-ha.${namespace}.svc.cluster.local`;
  const haAltNames = [
      haCommonName,
      `${queueManagerName}-ha.${namespace}.svc`,
      `${queueManagerName}-ha`,
  ];
  const ha = createCertificate(haCommonName, haAltNames, caCert, caKeys.privateKey, certValidityDays);

  // 4. Convert all to PEM format
  return {
    ca: pki.certificateToPem(caCert),
    cert: pki.certificateToPem(qmgr.cert),
    key: pki.privateKeyToPem(qmgr.key),
    haCert: pki.certificateToPem(ha.cert),
    haKey: pki.privateKeyToPem(ha.key),
  };
};