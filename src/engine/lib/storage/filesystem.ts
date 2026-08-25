export interface SavedFile {
    id: string;
    hash: string;
}
export interface BaseFileSystem {
    save(data: Buffer): Promise<SavedFile>;
    write(id: string, data: Buffer): Promise<string>;
    delete(id: string): Promise<void>;
    url(id: string): string | undefined;
    read(id: string): Promise<Buffer | undefined>;
}
