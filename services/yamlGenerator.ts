import type { MQConfig } from '../types';

const toBase64 = (str: string) => btoa(str);

// A list of system channels that we shouldn't try to redefine.
const systemChannels = ['SYSTEM.DEF.SVRCONN', 'SYSTEM.AUTO.SVRCONN'];

export const generateMQYaml = (config: MQConfig): string => {
  if (!config.tls) {
    return '# TLS data not generated yet.';
  }

  const { queueManagerName, namespace, availability, storageClassName, tls, haCipherSpec, licenseUse, channelName, createSampleQueue, sampleQueueName, createAdminQueue, adminQueueName } = config;

  const qmgrCertSecretName = `${queueManagerName}-qmgr-cert`;
  const haCertSecretName = `${queueManagerName}-ha-cert`;
  const caCertSecretName = `mq-ca-cert`;
  const mqscConfigMapName = `${queueManagerName}-mqsc`;
  let mqscContent = '';

  // Conditionally define the client channel if it's not a default system channel
  if (!systemChannels.includes(channelName.toUpperCase())) {
      mqscContent += `DEFINE CHANNEL('${channelName}') CHLTYPE(SVRCONN) TRPTYPE(TCP) SSLCIPH('${haCipherSpec}') SSLCAUTH(OPTIONAL) REPLACE\\n`;
  }
  
  // Conditionally define the sample queue
  if (createSampleQueue && sampleQueueName) {
      mqscContent += `DEFINE QLOCAL('${sampleQueueName}') REPLACE\\n`;
  }

  // Conditionally define the admin queue
  if (createAdminQueue && adminQueueName) {
      mqscContent += `DEFINE QLOCAL('${adminQueueName}') REPLACE\\n`;
  }

  const yamlDocs = [
    // 1. CA Public Cert Secret
    `
apiVersion: v1
kind: Secret
metadata:
  name: ${caCertSecretName}
  namespace: ${namespace}
type: Opaque
data:
  ca.crt: ${toBase64(tls.ca)}
`,
    // 2. Queue Manager TLS Secret
    `
apiVersion: v1
kind: Secret
metadata:
  name: ${qmgrCertSecretName}
  namespace: ${namespace}
type: kubernetes.io/tls
data:
  tls.crt: ${toBase64(tls.cert)}
  tls.key: ${toBase64(tls.key)}
  ca.crt: ${toBase64(tls.ca)}
`,
    // 3. Native HA TLS Secret
    `
apiVersion: v1
kind: Secret
metadata:
  name: ${haCertSecretName}
  namespace: ${namespace}
type: kubernetes.io/tls
data:
  tls.crt: ${toBase64(tls.haCert)}
  tls.key: ${toBase64(tls.haKey)}
  ca.crt: ${toBase64(tls.ca)}
`,
  ];
  
  // 4. Conditionally add the MQSC ConfigMap
  if (mqscContent) {
    yamlDocs.push(`
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${mqscConfigMapName}
  namespace: ${namespace}
data:
  config.mqsc: |
    ${mqscContent.trim().replace(/\\n/g, '\n    ')}
`);
  }

  // 5. QueueManager Custom Resource
  yamlDocs.push(`
apiVersion: mq.ibm.com/v1beta1
kind: QueueManager
metadata:
  name: ${queueManagerName}
  namespace: ${namespace}
spec:
  license:
    accept: true
    license: L-YBXJ-ADJNSM
    use: ${licenseUse}
  queueManager:
    name: ${queueManagerName.toUpperCase()}
    ${mqscContent ? `mqsc:
      - configMap:
          name: ${mqscConfigMapName}
          items:
            - config.mqsc` : ''}
    storage:
      queueManager:
        type: persistent-claim
        class: ${storageClassName}
  availability:
    type: ${availability}
    ${availability === 'NativeHA' ? `
    tls:
      cipherSpec: ${haCipherSpec}
      keySecret:
        secretName: ${haCertSecretName}
      caSecret:
        secretName: ${caCertSecretName}
` : ''}
  pki:
    keys:
      - name: default
        secret:
          secretName: ${qmgrCertSecretName}
          items:
            - tls.key
            - tls.crt
    trust:
      - name: ca
        secret:
          secretName: ${caCertSecretName}
          items:
            - ca.crt
`);

  return yamlDocs.map(doc => doc.trim()).join('\n---\n');
};

export const generateVerificationCommands = (config: MQConfig): string => {
    const { queueManagerName, namespace } = config;

    return `
# Watch the Queue Manager deployment status
oc get queuemanager ${queueManagerName} -n ${namespace} -w

# Check the status of the pods
oc get pods -l app.kubernetes.io/instance=${queueManagerName} -n ${namespace} -w

# Once the pods are running, you can exec into a pod to run MQSC commands
# Find a running pod name first:
# POD_NAME=$(oc get pods -l app.kubernetes.io/instance=${queueManagerName} -n ${namespace} -o jsonpath='{.items[0].metadata.name}')
# oc exec -it $POD_NAME -n ${namespace} -- runmqsc ${queueManagerName.toUpperCase()}
`.trim();
};