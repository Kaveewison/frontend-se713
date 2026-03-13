// Environment Configuration
// Reads configuration from environment variables

interface EnvironmentConfig {
  apiBaseUrl: string;
  requestTimeout: number;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
}

function createConfig(): EnvironmentConfig {
  const apiBaseUrl = getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api');
  const requestTimeout = parseInt(getEnvVar('VITE_REQUEST_TIMEOUT', '30000'), 10);

  return {
    apiBaseUrl,
    requestTimeout,
  };
}

export const config = createConfig();
