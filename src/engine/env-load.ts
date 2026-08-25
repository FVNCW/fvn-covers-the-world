export const env = Bun.env as {
    FCTW_POSTGRE_LOGON: string;
    FCTW_CORS: string;
    FCTW_PORT: string;
} & typeof Bun.env;
export function numberEnv(key: keyof typeof env): number {
    return Number(env[key]);
}
