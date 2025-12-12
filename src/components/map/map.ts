/// <reference types="google.maps" />
import "./map.css";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import mapStyles from "./mapStyles";
import type { MissionTask } from "../../types/types";

let optionsInitialized = false;
let mapInstance: google.maps.Map | null = null;
let MarkerClass: typeof google.maps.Marker | null = null;
let markers: google.maps.Marker[] = [];

export async function renderMap(host: HTMLDivElement): Promise<void> {
  host.innerHTML = `
    <div id="map"></div>
  `;
  const mapStyle = mapStyles;
  const mapHost = host.querySelector<HTMLDivElement>("#map");
  if (!mapHost) return;

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    console.warn(
      "Google Maps API key mangler. Sæt VITE_GOOGLE_API_KEY i .env."
    );
    return;
  }

  if (!optionsInitialized) {
    setOptions({
      key: apiKey,
      v: "weekly",
    });
    optionsInitialized = true;
  }

  const { Map } = await importLibrary("maps");
  const { Marker } = (await importLibrary(
    "marker"
  )) as google.maps.MarkerLibrary;

  MarkerClass = Marker;
  mapInstance = new Map(mapHost, {
    center: { lat: 55.6761, lng: 12.5683 },
    zoom: 12,
    styles: mapStyle,
  });
}

function clearMarkers() {
  markers.forEach((m) => m.setMap(null));
  markers = [];
}

export function showTasksOnMap(tasks: MissionTask[]): void {
  if (!mapInstance || !MarkerClass) return;

  clearMarkers();

  if (!tasks.length) return;

  const bounds = new google.maps.LatLngBounds();

  tasks.forEach((task) => {
    const position = { lat: task.Latitude, lng: task.Longitude };
    const marker = new MarkerClass!({
      map: mapInstance!,
      position,
      title: task.Title,
    });
    markers.push(marker);
    bounds.extend(position);
  });

  mapInstance.fitBounds(bounds);
}

export function focusTaskOnMap(task: MissionTask): void {
  if (!mapInstance || !MarkerClass) return;

  clearMarkers();

  const position = { lat: task.Latitude, lng: task.Longitude };
  const marker = new MarkerClass({
    map: mapInstance,
    position,
    title: task.Title,
  });
  markers.push(marker);

  mapInstance.setCenter(position);
  mapInstance.setZoom(15);
}
