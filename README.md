# IBM MQ Native HA Config Wizard

A web-based wizard to generate deployment configurations for an IBM MQ Native HA Queue Manager on OpenShift, complete with TLS protection and a sample queue.

This project is a standalone, client-side application built with React. It runs entirely in the browser and has no server-side components or external API dependencies.

## Features

-   **Step-by-Step Wizard:** Guides users through the configuration process.
-   **Configuration Options:** Customize Queue Manager name, namespace, storage, license, and more.
-   **Automatic TLS Generation:** Generates a self-signed CA and server certificates for MQ client communication and Native HA replication.
-   **YAML & Script Generation:** Produces Kubernetes YAML for deployment, verification shell commands, and a sample client CCDT file.
-   **Downloadable Artifacts:** Easily download all generated configuration files and certificates.

## Running Locally

This project is designed to be run from a simple static file server, as all dependencies are loaded from a CDN via an import map.

1.  **Prerequisites:**
    *   A modern web browser.
    *   A local web server. You can use any simple server, for example, Python's built-in server or the `http-server` package from npm.

2.  **Serve the Project Files:**
    *   Navigate to the project's root directory in your terminal.
    *   **Using Python:**
        ```bash
        # For Python 3
        python3 -m http.server
        ```
    *   **Using Node.js:**
        ```bash
        # Install http-server globally if you haven't already
        # npm install -g http-server
        
        # Or run it directly with npx
        npx http-server
        ```

3.  **Access the Application:**
    *   Open your web browser and navigate to the address provided by the local server (usually `http://localhost:8000` or `http://localhost:8080`).

The application should now be running in your browser.
