export interface MissionTask {
  ID: number;
  Title: string;
  Description: string;
  Type: "Land" | "Sø";
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
