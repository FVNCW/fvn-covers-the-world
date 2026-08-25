import { createHash, randomUUID } from "node:crypto";
import type { BaseFileSystem, SavedFile } from "./filesystem";
export interface OSSFSConfig {
    publicUrl: string;
    endpoint?: string;
}
export class OSSFS implements BaseFileSystem {
    constructor(private readonly config: OSSFSConfig) { }
    private key(id: string) {
        return id;
    }
    async save(data: Buffer): Promise<SavedFile> {
        const id = randomUUID();
        const hash = this.hash(data);
        await this.put(this.key(id), data);
        return { id, hash };
    }
    async write(id: string, data: Buffer): Promise<string> {
        const hash = this.hash(data);
        await this.put(this.key(id), data);
        return hash;
    }
    async delete(id: string): Promise<void> {
        if (this.config.endpoint) {
            const res = await fetch(`${this.config.endpoint}/${this.key(id)}`, {
                method: "DELETE",
            });
        }
    }
    url(id: string): string {
        return `${this.config.publicUrl.replace(/\/+$/, "")}/${this.key(id)}`;
    }
    private async put(key: string, data: Buffer): Promise<void> {
        if (!this.config.endpoint) return;
        const res = await fetch(`${this.config.endpoint}/${key}`, {
            method: "PUT",
            body: data,
            headers: { "Content-Type": "application/octet-stream" },
        });
    }
    private hash(data: Buffer): string {
        return createHash("sha256").update(data).digest("hex");
    }
}