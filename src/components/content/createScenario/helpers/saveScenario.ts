import type {
  Env,
  JsonBinRead,
  MissionTask,
  ScenarioType,
} from "../../../../types/types";

function envFromType(type: ScenarioType): Env {
  return type === "Land" ? "land" : "sea";
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function avgCenter(tasks: MissionTask[]) {
  const n = tasks.length || 1;
  const lat = tasks.reduce((a, t) => a + t.latitude, 0) / n;
  const lng = tasks.reduce((a, t) => a + t.longitude, 0) / n;
  return { lat, lng };
}

export default async function saveScenarioToJsonBin(
  currentType: ScenarioType | null,
  scenarioDraft?: { name: string; description: string },
  tasks?: MissionTask[]
) {
  if (!currentType || !scenarioDraft || !tasks) return;

  const env = envFromType(currentType);
  const now = new Date().toISOString();

  const scenarioId = `${slugify(scenarioDraft.name || env)}-${now.slice(
    0,
    10
  )}`;
  const center = avgCenter(tasks);

  const newScenario = {
    scenarioId,
    title: scenarioDraft.name,
    description: scenarioDraft.description,
    type: env,
    createdBy: "Gamemaster",
    createdAt: now,
    map: {
      center,
      zoom: 13,
      markers: tasks.map((t, i) => ({
        markerId: `m${i + 1}`,
        taskId: t.id,
        lat: t.latitude,
        lng: t.longitude,
        radius: t.radius,
        environment: env,
      })),
    },
    tasks: tasks.map((t) => ({
      taskId: t.id,
      title: t.title,
      description: t.description,
      environment: env,
      locationName: t.location,
      difficulty: t.difficulty,
      activationCondition: t.activationCondition,
      options: t.options,
      geo: { lat: t.latitude, lng: t.longitude, radius: t.radius },
    })),
  };

  const binId = import.meta.env.VITE_JSONBIN_ID as string;
  const key = import.meta.env.VITE_JSONBIN_KEY as string; // master OR access key
  const keyHeader =
    (import.meta.env.VITE_JSONBIN_KEY_HEADER as string) || "X-Master-Key";

  if (!binId || !key) return;

  const url = `https://api.jsonbin.io/v3/b/${binId}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [keyHeader]: key,
  };

  const readRes = await fetch(url, { headers });

  if (!readRes.ok) {
    throw new Error(
      `JSONBin read failed: ${readRes.status} ${readRes.statusText}`
    );
  }
  const current = (await readRes.json()) as JsonBinRead;
  const currentRecord = current.record ?? {};
  const existingScenarios = Array.isArray(currentRecord.scenarios)
    ? currentRecord.scenarios
    : [];

  const idx = existingScenarios.findIndex(
    (s) => s.scenarioId === newScenario.scenarioId
  );

  const nextScenarios =
    idx >= 0
      ? existingScenarios.map((s, i) => (i === idx ? newScenario : s))
      : [...existingScenarios, newScenario];

  const nextRecord = {
    ...currentRecord,
    scenarios: nextScenarios,
  };

  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      [keyHeader]: key,
    },
    body: JSON.stringify(nextRecord),
  });

  if (!res.ok) {
    throw new Error(`Save failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
