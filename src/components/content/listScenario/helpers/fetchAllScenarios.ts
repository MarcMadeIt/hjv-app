import type { JsonBinRead, RemoteScenario } from "../../../../types/types";

export default async function fetchAllScenarios(): Promise<RemoteScenario[]> {
  const binId = import.meta.env.VITE_JSONBIN_ID as string;
  const key = import.meta.env.VITE_JSONBIN_KEY as string;
  const keyHeader =
    (import.meta.env.VITE_JSONBIN_KEY_HEADER as string) || "X-Master-Key";

  if (!binId || !key) return [];

  const url = `https://api.jsonbin.io/v3/b/${binId}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      [keyHeader]: key,
    },
  });

  if (!res.ok) {
    throw new Error(`JSONBin read failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as JsonBinRead;
  const record = data.record ?? {};
  const scenarios = Array.isArray((record as any).scenarios)
    ? ((record as any).scenarios as RemoteScenario[])
    : [];

  // newest first
  scenarios.sort((a, b) =>
    String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))
  );

  return scenarios;
}
