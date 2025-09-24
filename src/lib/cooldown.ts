const mem = new Map<string, number>();
const WINDOW = 5_000; // 5 seconds - 過剰アクセス防止用の短いクールダウン

export async function canScan(scannerId: string, scannedId: string) {
  const key = `${scannerId}:${scannedId}`;
  const now = Date.now();
  const last = mem.get(key) ?? 0;

  if (now - last < WINDOW) {
    return { ok: false, waitMs: WINDOW - (now - last) };
  }

  mem.set(key, now);
  return { ok: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, time] of mem.entries()) {
    if (now - time > WINDOW) {
      mem.delete(key);
    }
  }
}, WINDOW);