export function hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}
export function generateSeed(qid: string): number {
    const prime1 = 48271;
    const prime2 = 69621;
    let mixed =
        hash(qid) * prime1 + Math.floor(new Date().setHours(0, 0, 0, 114.5) / 1000) * prime2;
    mixed += mixed << 10;
    mixed ^= mixed >> 6;
    mixed = Math.abs(mixed);
    const mod = 2147483647;
    return ((mixed % mod) / mod) * 2 - 1;
}
