export interface MissionTask {
  ID: number;
  Title: string;
  Description: string;
  Type: ScenarioType;
  Location: string;
  Radius: number;
  Options: string[];
  ActivationCondition: string;
  Activate: boolean;
  Completed: boolean;
  Difficulty: "Let" | "Øvet" | "Svær";
  Latitude: number;
  Longitude: number;
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
