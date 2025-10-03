import type { MQConfig } from '../types';

/**
 * Generates a sample Client Channel Definition Table (CCDT) JSON file.
 *
 * This file is essential for connecting MQ clients to your new Queue Manager.
 *
 * ### CRITICAL POST-DEPLOYMENT STEPS ###
 * To enable client connections from outside the cluster, you must manually perform these steps:
 *
 * 1. **Create an OpenShift Route:** You must create an OpenShift Route that exposes the
 *    Queue Manager's listener service (which targets port 1414). A secure 'passthrough'
 *    route is recommended.
 *
 * 2. **Replace the Placeholder Hostname:** In the generated CCDT JSON, you will find a
 *    placeholder hostname. You **must** replace this placeholder with the **actual hostname**
 *    from the OpenShift Route you created in step 1.
 *
 * @param config The MQ configuration object.
 * @returns A JSON string representing the CCDT file.
 */
export const generateCcdtJson = (config: MQConfig): string => {
  const { queueManagerName, channelName, haCipherSpec } = config;

  const ccdt = {
    "channel": [
      {
        "name": channelName,
        "clientConnection": {
          "connection": [
            {
              "host": `<HOSTNAME_FOR_${queueManagerName}_ROUTE>`,
              // Note: OpenShift Routes expose services on port 443 (HTTPS) by default.
              "port": 443
            }
          ],
          "queueManager": queueManagerName.toUpperCase()
        },
        "transmissionSecurity": {
          "cipherSpecification": haCipherSpec
        },
        "type": "clientConnection"
      }
    ]
  };

  return JSON.stringify(ccdt, null, 2);
};
