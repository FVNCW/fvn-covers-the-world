import { mkdir, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import type { BaseFileSystem, SavedFile } from "./filesystem";
export class LocalFS implements BaseFileSystem {
    constructor(private readonly root: string = "./data/objects") {}
    private ofName(id: string) {
        return join(this.root, id);
    }
    async save(data: Buffer): Promise<SavedFile> {
        const id = randomUUID();
        const hash = this.hash(data);
        const file = this.ofName(id);
        await mkdir(dirname(file), { recursive: true });
        await Bun.write(file, data);
        return { id, hash };
    }
    async write(id: string, data: Buffer): Promise<string> {
        const hash = this.hash(data);
        await Bun.write(this.ofName(id), data);
        return hash;
    }
    async delete(id: string): Promise<void> {
        try {
            await unlink(this.ofName(id));
        } catch {}
    }
    async read(id: string): Promise<Buffer | undefined> {
        try {
            const file = Bun.file(this.ofName(id));
            return Buffer.from(await file.arrayBuffer());
        } catch {
            return undefined;
        }
    }
    url(): string | undefined {
        return undefined;
    }
    private hash(data: Buffer): string {
        return createHash("sha256").update(data).digest("hex");
    }
}
