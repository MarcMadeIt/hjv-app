import type { MissionTask } from "../../../../types/types";

export async function fetchTasks(): Promise<MissionTask[]> {
  try {
    const res = await fetch("https://gruppe2-opgaver.onrender.com/export");

    return await res.json();
  } catch {
    console.warn("Kunne ikke hente tasks.json, prøver mock-team1.json");
    return [];
  }
}
