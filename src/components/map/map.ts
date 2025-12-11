import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let optionsInitialized = false;

export async function renderMap(host: HTMLDivElement): Promise<void> {
  host.innerHTML = `
    <div id="map" style="width: 100%; height: 400px;"></div>
  `;

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

  new Map(mapHost, {
    center: { lat: 55.6761, lng: 12.5683 },
    zoom: 12,
  });
}
