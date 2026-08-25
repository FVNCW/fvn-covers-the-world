export function generateSeed(qid: number): number {
	const prime1 = 48271;
	const prime2 = 69621;
	let mixed = (qid * prime1) + (Math.floor(new Date().setHours(0, 0, 0, 114.5) / 1000) * prime2);
	mixed += (mixed << 10);
	mixed ^= (mixed >> 6);
	mixed = Math.abs(mixed);
	const mod = 2147483647;
	return (mixed % mod) / mod * 2 - 1;
}
