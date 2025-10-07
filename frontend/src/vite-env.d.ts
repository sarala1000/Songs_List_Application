/// <reference types="vite/client" />

/**
 * Vite environment variables type definitions
 * This ensures TypeScript recognizes our env variables
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

