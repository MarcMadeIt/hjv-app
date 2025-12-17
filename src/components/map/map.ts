/// <reference types="google.maps" />
import "./map.css";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import mapStyles from "./mapStyles";
import type { MissionTask, RemoteScenario } from "../../types/types";

let optionsInitialized = false;
let mapInstance: google.maps.Map | null = null;
let MarkerClass: typeof google.maps.Marker | null = null;
let markers: google.maps.Marker[] = [];
let activeInfoWindow: google.maps.InfoWindow | null = null;
let pickClickListener: google.maps.MapsEventListener | null = null;
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
  if (activeInfoWindow) {
    activeInfoWindow.close();
    activeInfoWindow = null;
  }
  stopPickMode();
}

export function showTasksOnMap(tasks: MissionTask[]): void {
  if (!mapInstance || !MarkerClass) return;

  clearMarkers();

  if (!tasks.length) return;

  const bounds = new google.maps.LatLngBounds();

  tasks.forEach((task) => {
    const position = { lat: task.latitude, lng: task.longitude };
    const marker = new MarkerClass!({
      map: mapInstance!,
      position,
      title: task.title,
      label: {
        text: task.title,
        fontSize: "12px",
        fontWeight: "600",
        color: "#262523",
      },
      icon: {
        url: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
        labelOrigin: new google.maps.Point(12, 50),
      },
    });

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

  const position = { lat: task.latitude, lng: task.longitude };
  const marker = new MarkerClass({
    map: mapInstance,
    position,
    title: task.title,
    label: {
      text: task.title,
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

export function showScenarioOnMap(scenario: RemoteScenario): void {
  if (!mapInstance || !MarkerClass) return;

  clearMarkers();

  const tasks = scenario.tasks ?? [];
  const markerMeta = scenario.map?.markers ?? [];
  const fallbackCenter = scenario.map?.center ?? { lat: 55.6761, lng: 12.5683 };

  const points = tasks.length
    ? tasks.map((task, idx) => ({
        lat: task.geo?.lat ?? markerMeta[idx]?.lat ?? fallbackCenter.lat,
        lng: task.geo?.lng ?? markerMeta[idx]?.lng ?? fallbackCenter.lng,
        title: task.title || `Punkt ${idx + 1}`,
      }))
    : markerMeta.map((m, idx) => ({
        lat: m.lat,
        lng: m.lng,
        title: tasks[idx]?.title || `Punkt ${idx + 1}`,
      }));

  if (!points.length) return;

  const bounds = new google.maps.LatLngBounds();

  points.forEach((point) => {
    const position = { lat: point.lat, lng: point.lng };

    const marker = new MarkerClass!({
      map: mapInstance!,
      position,
      title: point.title,
      label: {
        text: point.title,
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
    bounds.extend(position);
  });

  if (points.length === 1) {
    mapInstance.setCenter({ lat: points[0].lat, lng: points[0].lng });
    mapInstance.setZoom(scenario.map?.zoom ?? 14);
  } else {
    mapInstance.fitBounds(bounds);
  }
}

/*  interactive card */
function openTaskEditorInfoWindow(
  task: MissionTask,
  marker: google.maps.Marker
) {
  if (!mapInstance) return;

  // Close previous window + stop any active pick-mode
  if (activeInfoWindow) activeInfoWindow.close();
  stopPickMode();

  const container = document.createElement("div");
  container.className = "task-card";

  container.innerHTML = `
    <h3 class="task-card__title">${task.title}</h3>

    <div class="task-card__row">
      <label>Lat</label>
      <input class="lat" type="number" step="0.000001" value="${task.latitude}">
    </div>

    <div class="task-card__row">
      <label>Lng</label>
      <input class="lng" type="number" step="0.000001" value="${task.longitude}">
    </div>

    <div class="task-card__actions">
      <button class="save">Gem</button>
      <button class="pick">Vælg fra kort</button>
      <span class="status" style="margin-left:8px;"></span>
    </div>
  `;

  const latInput = container.querySelector<HTMLInputElement>("input.lat")!;
  const lngInput = container.querySelector<HTMLInputElement>("input.lng")!;
  const saveBtn = container.querySelector<HTMLButtonElement>("button.save")!;
  const pickBtn = container.querySelector<HTMLButtonElement>("button.pick")!;
  const status = container.querySelector<HTMLSpanElement>("span.status")!;

  saveBtn.addEventListener("click", () => {
    const lat = Number(latInput.value);
    const lng = Number(lngInput.value);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      status.textContent = "Ugyldige koordinater";
      return;
    }

    onTaskCoordsDraftChange?.(task.id, lat, lng);

    marker.setPosition({ lat, lng });

    status.textContent =
      "Gemt <i class='icon icon-checkmark' aria-hidden='true'></i>";
  });

  let picking = false;

  const resetPickButton = () => {
    picking = false;
    pickBtn.style.display = "";
  };

  pickBtn.addEventListener("click", () => {
    if (picking) return;

    picking = true;
    pickBtn.style.display = "none";
    status.textContent = "Vælg en ny placering på kortet";

    startPickMode((lat, lng) => {
      latInput.value = String(lat);
      lngInput.value = String(lng);
      marker.setPosition({ lat, lng });

      stopPickMode();
      resetPickButton();
      status.textContent = "Placering klar - klik Gem";
    });
  });

  const info = new google.maps.InfoWindow({ content: container });
  activeInfoWindow = info;

  info.addListener("closeclick", () => {
    stopPickMode();
    resetPickButton();
    status.textContent = "";
  });

  info.open({ map: mapInstance, anchor: marker });
}

function startPickMode(onPick: (lat: number, lng: number) => void) {
  if (!mapInstance) return;

  stopPickMode();

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

export function refreshMapView(): void {
  if (!mapInstance) return;

  google.maps.event.trigger(mapInstance, "resize");

  if (!markers.length) {
    return;
  }

  if (markers.length === 1) {
    const position = markers[0].getPosition();
    if (position) {
      mapInstance.setCenter(position);
    }
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  markers.forEach((marker) => {
    const position = marker.getPosition();
    if (position) bounds.extend(position);
  });

  if (!bounds.isEmpty()) {
    mapInstance.fitBounds(bounds);
  }
}
