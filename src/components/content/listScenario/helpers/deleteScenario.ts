import type { JsonBinRead } from "./../../../../types/types";

export default async function deleteScenario(
  scenarioId: string
): Promise<void> {
  const binId = import.meta.env.VITE_JSONBIN_ID as string;
  const key = import.meta.env.VITE_JSONBIN_KEY as string;
  const keyHeader =
    (import.meta.env.VITE_JSONBIN_KEY_HEADER as string) || "X-Master-Key";

  if (!binId || !key) return;

  const url = `https://api.jsonbin.io/v3/b/${binId}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [keyHeader]: key,
  };

  // READ
  const readRes = await fetch(url, { headers });
  if (!readRes.ok) {
    throw new Error(
      `JSONBin read failed: ${readRes.status} ${readRes.statusText}`
    );
  }

  const current = (await readRes.json()) as JsonBinRead;
  const currentRecord = current.record ?? {};
  const existingScenarios = Array.isArray((currentRecord as any).scenarios)
    ? ((currentRecord as any).scenarios as any[])
    : [];

  // FILTER OUT
  const nextScenarios = existingScenarios.filter(
    (s) => s?.scenarioId !== scenarioId
  );

  // PUT
  const nextRecord = { ...(currentRecord as any), scenarios: nextScenarios };

  const putRes = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(nextRecord),
  });

  if (!putRes.ok) {
    throw new Error(`Delete failed: ${putRes.status} ${putRes.statusText}`);
  }
}
