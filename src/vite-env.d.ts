/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPEAKING_ROOM_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
