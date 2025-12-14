/// <reference types="google.maps" />
import "./map.css";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import mapStyles from "./mapStyles";
import type { MissionTask } from "../../types/types";

let optionsInitialized = false;
let mapInstance: google.maps.Map | null = null;
let MarkerClass: typeof google.maps.Marker | null = null;
let markers: google.maps.Marker[] = [];
let activeInfoWindow: google.maps.InfoWindow | null = null;
let pickClickListener: google.maps.MapsEventListener | null = null;
//callback hook
let onTaskCoordsDraftChange:
  | ((taskId: number, lat: number, lng: number) => void)
  | null = null;

export function setOnTaskCoordsDraftChange(
  fn: ((taskId: number, lat: number, lng: number) => void) | null
) {
  onTaskCoordsDraftChange = fn;
}

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
      label: {
        text: task.Title,
        fontSize: "12px",
        fontWeight: "600",
        color: "#262523",
      },
      icon: {
        url: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
        labelOrigin: new google.maps.Point(12, 50),
      },
    });
    //click handler
    marker.addListener("click", () => {
    openTaskEditorInfoWindow(task, marker);
   });

    markers.push(marker);
    bounds.extend(position);
  });

  mapInstance.fitBounds(bounds);
}

export function focusTaskOnMap(task: MissionTask): void {
  if (!mapInstance || !MarkerClass) return;

/*  clearMarkers(); */

  const position = { lat: task.Latitude, lng: task.Longitude };
  const marker = new MarkerClass({
    map: mapInstance,
    position,
    title: task.Title,
    label: {
      text: task.Title,
      fontSize: "12px",
      fontWeight: "600",
      color: "#262523",
    },
    icon: {
      url: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
      labelOrigin: new google.maps.Point(12, 50),
    },
    });
  markers.push(marker);

  mapInstance.setCenter(position);
  mapInstance.setZoom(18);
}

/*  interactive card */
function openTaskEditorInfoWindow(task: MissionTask, marker: google.maps.Marker) {
  if (!mapInstance) return;

  // Close previous window + stop any active pick-mode
  if (activeInfoWindow) activeInfoWindow.close();
  stopPickMode();

  const container = document.createElement("div");
  container.className = "task-card";

  container.innerHTML = `
    <h3 class="task-card__title">${task.Title}</h3>

    <div class="task-card__row">
      <label>Lat</label>
      <input class="lat" type="number" step="0.000001" value="${task.Latitude}">
    </div>

    <div class="task-card__row">
      <label>Lng</label>
      <input class="lng" type="number" step="0.000001" value="${task.Longitude}">
    </div>

    <div class="task-card__actions">
      <button class="save">Save</button>
      <button class="pick">Pick from map</button>
      <span class="status" style="margin-left:8px;"></span>
    </div>
  `;

  const latInput = container.querySelector<HTMLInputElement>("input.lat")!;
  const lngInput = container.querySelector<HTMLInputElement>("input.lng")!;
  const saveBtn = container.querySelector<HTMLButtonElement>("button.save")!;
  const pickBtn = container.querySelector<HTMLButtonElement>("button.pick")!;
  const status = container.querySelector<HTMLSpanElement>("span.status")!;

  // Save: update marker + task and local callback
  saveBtn.addEventListener("click", () => {
    const lat = Number(latInput.value);
    const lng = Number(lngInput.value);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      status.textContent = "Invalid coordinates";
      return;
    }

    onTaskCoordsDraftChange?.(task.ID, lat, lng); //store the change in taskDrafts

    marker.setPosition({ lat, lng }); //change cursor?
  
    status.textContent = "Saved ✓"; //add button?

    // updateTaskCoordinates(task.Id, lat, lng)
  });

  // Pick from map: toggle map click listener
  let picking = false;

  pickBtn.addEventListener("click", () => {
    picking = !picking;

    if (picking) {
      pickBtn.textContent = "Click on map… (stop)";
      status.textContent = "Pick a new location";
      startPickMode((lat, lng) => {
        latInput.value = String(lat);
        lngInput.value = String(lng);
        marker.setPosition({ lat, lng });
      });
    } else {
      pickBtn.textContent = "Pick from map";
      status.textContent = "";
      stopPickMode();
    }
  });

  const info = new google.maps.InfoWindow({ content: container });
  activeInfoWindow = info;

  info.addListener("closeclick", () => {
    stopPickMode();
  });

  info.open({ map: mapInstance, anchor: marker });
}

//pick-mode helpers//

function startPickMode(onPick: (lat: number, lng: number) => void) {
  if (!mapInstance) return;

  stopPickMode(); // ensure only one listener at a time

    pickClickListener = mapInstance.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        onPick(e.latLng.lat(), e.latLng.lng());
      }
    );
}

function stopPickMode() {
  if (pickClickListener) {
    google.maps.event.removeListener(pickClickListener);
    pickClickListener = null;
  }
}
