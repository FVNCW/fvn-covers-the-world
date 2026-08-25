import { env } from "../../env-load";
import { LocalFS } from "./local";
import { OSSFS } from "./oss";
import type { BaseFileSystem } from "./filesystem";
export type { BaseFileSystem, SavedFile } from "./filesystem";
function createFileSystem(): BaseFileSystem {
    switch (env.FCTW_STORAGE_MODE.toLowerCase()) {
        case "oss":
        case "s3":
            return new OSSFS({
                publicUrl: env.FCTW_STORAGE_OSS_URL,
                endpoint: env.FCTW_STORAGE_OSS_ENDPOINT,
            });
        case "local":
        default:
            return new LocalFS(env.FCTW_OBJECT_STORAGE);
    }
}
export const fs: BaseFileSystem = createFileSystem();