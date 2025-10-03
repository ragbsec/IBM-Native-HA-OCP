export interface TlsData {
  ca: string;
  cert: string;
  key: string;
  haCert: string;
  haKey: string;
}

export const supportedCipherSpecs = [
  'ANY_TLS12_OR_HIGHER',
  'TLS_AES_256_GCM_SHA384',
  'TLS_AES_128_GCM_SHA256',
  'TLS_CHACHA20_POLY1305_SHA256',
  'TLS_RSA_WITH_AES_256_GCM_SHA384',
  'TLS_RSA_WITH_AES_128_GCM_SHA256',
];

export type LicenseUse = 'Production' | 'NonProduction';

export interface MQConfig {
  queueManagerName: string;
  namespace: string;
  availability: 'SingleInstance' | 'NativeHA';
  storageClassName: string;
  licenseUse: LicenseUse;
  caValidityDays: number;
  certValidityDays: number;
  haCipherSpec: string;
  channelName: string;
  createSampleQueue: boolean;
  sampleQueueName: string;
  createAdminQueue: boolean;
  adminQueueName: string;
  tls?: TlsData;
}