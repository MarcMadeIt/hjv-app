export interface MissionTask {
  id: number;
  title: string;
  description: string;
  type: ScenarioType;
  location: string;
  radius: number;
  options: string[];
  activationCondition: string;
  activated: boolean;
  completed: boolean;
  difficulty: "Let" | "Øvet" | "Svær";
  latitude: number;
  longitude: number;
}

export type ScenarioType = "Land" | "Sø";
export type Env = "land" | "sea";

export type RemoteScenario = {
  scenarioId: string;
  title: string;
  description: string;
  type: Env;
  createdBy: string;
  createdAt: string;
  map: {
    center: { lat: number; lng: number };
    zoom: number;
    markers: Array<{
      markerId: string;
      taskId: number;
      lat: number;
      lng: number;
      radius: number;
      environment: Env;
    }>;
  };
  tasks: Array<{
    taskId: number;
    title: string;
    description: string;
    environment: Env;
    locationName: string;
    difficulty: string;
    activationCondition: string;
    options: string[];
    geo: { lat: number; lng: number; radius: number };
  }>;
};

export type JsonBinRead = {
  record: { scenarios?: RemoteScenario[]; [k: string]: unknown };
  metadata: unknown;
};
