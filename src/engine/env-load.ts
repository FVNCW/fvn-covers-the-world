export const env = process.env as {
    FCTW_POSTGRE_LOGON: string;
    FCTW_CORS: string;
    FCTW_PORT: string;
    FCTW_BETTERAUTH: string;
    FCTW_OBJECT_STORAGE: string;
    FCTW_STORAGE_MODE: string;
    FCTW_STORAGE_OSS_URL: string;
    FCTW_STORAGE_OSS_ENDPOINT: string;
} & typeof Bun.env;
export function numberEnv(key: keyof typeof env): number {
    return Number(env[key]);
}
