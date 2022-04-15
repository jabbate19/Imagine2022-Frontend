import React, { useRef, useState, useLayoutEffect, createRef } from "react";
import mapboxgl from "mapbox-gl";
import MarkerManager from "../Markers";
import { hideParentOnClick } from "../AdminPanel";
import * as APIMiddleware from "../../APIMiddleware";
import "../../../node_modules/mapbox-gl/dist/mapbox-gl.css";
import "./Map.scss";
import "../../glitchytext.scss";

const MARKER_UPDATE_INTERAL_MS = 10000;
const LOADING_MARKERS_TIMEOUT = 5000;
const STARTING_COORDINATES = [43.0847976948913, -77.67630082876184];
const STARTING_PITCH = 45;
const STARTING_BEARING = -17.6;
const STARTING_ZOOM = 19;
const MIN_ZOOM = 17;
export const MAX_BOUNDS = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(-77.687769, 43.078269),
  new mapboxgl.LngLat(-77.653682, 43.092718)
);
const BUILDING_FILL_COLOR = "#BC4A3C";
const BUILDING_FILL_OPACITY = 0.9;
// _OKD envvar used if run on OKD (can't edit .env on OKD)
mapboxgl.accessToken =
  process.env.REACT_APP_MAPBOX_TOKEN_OKD ||
  process.env.REACT_APP_MAPBOX_TOKEN ||
  "";

class AdminPanelToggler {
  _map: mapboxgl.Map | undefined;
  _container: HTMLDivElement | undefined;

  onAdd(map: mapboxgl.Map) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.classList.add("mapboxgl-ctrl", "mapboxgl-ctrl-group");
    let _adminPanel = document.getElementById("admin-panel");
    let _button = document.createElement("button");
    _button.id = "admin-panel-toggle";
    _button.classList.add("mapboxgl-ctrl-icon");
    _button.textContent = "Admin Panel";
    if (_adminPanel)
      _button.addEventListener(
        "click",
        hideParentOnClick.bind(null, _adminPanel)
      );
    this._container.appendChild(_button);
    return this._container;
  }

  onRemove() {
    this._container?.parentNode?.removeChild(this._container);
    this._map = undefined;
  }
}
export const Map: React.FunctionComponent = () => {
  const mapContainer: React.RefObject<HTMLDivElement> = createRef();
  const map = useRef<mapboxgl.Map>();
  const markerManager = new MarkerManager(map);
  let _updateInterval: ReturnType<typeof setInterval>;
  const [_loadingMarkers, setLoadingMarkers] = useState(true);
  const [_lat, setLat] = useState(STARTING_COORDINATES[0]);
  const [_long, setLng] = useState(STARTING_COORDINATES[1]);
  const [zoom, setZoom] = useState(STARTING_ZOOM);

  function _setupControls() {
    map.current?.addControl(new AdminPanelToggler(), "top-left");
    map.current?.addControl(new mapboxgl.NavigationControl());
    map.current?.addControl(new mapboxgl.FullscreenControl());
  }

  async function _updateBeaconMarkers() {
    setLoadingMarkers(true);
    let beacons = await APIMiddleware.retrieveBeacons();
    markerManager.updateHackerLocations(beacons);
    // Update map with any new markers in markerManager._geojson
    markerManager.updateMarkers();
    setLoadingMarkers(false);
  }

  function _setupUpdateInterval() {
    return setInterval(() => {
      // Update markerManager._geojson with beacon locations
      _updateBeaconMarkers();
    }, MARKER_UPDATE_INTERAL_MS);
  }

  function _cleanup() {
    map.current = undefined;
    clearInterval(_updateInterval);
  }

  useLayoutEffect(() => {
    if (map.current) return; // initialize map only once
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v11",
        antialias: true,
        center: [_long, _lat],
        zoom: zoom,
        minZoom: MIN_ZOOM,
        pitch: STARTING_PITCH,
        bearing: STARTING_BEARING,
        maxBounds: MAX_BOUNDS,
      });
      if (map.current) {
        map.current?.on("load", () => {
          markerManager.initialize();
          APIMiddleware.initialize();
          // Insert the layer beneath any symbol layer.
          const layers = map.current?.getStyle().layers;
          const labelLayerId: string | undefined = layers?.find(
            (layer: any) => {
              let text_field: mapboxgl.Layout = layer.layout;
              return (
                layer.type === "symbol" && text_field?.hasOwnProperty("id")
              );
            }
          )?.id;
          // The 'building' layer in the Mapbox
          // vector tileset contains building height data
          // from OpenStreetMap.
          map.current?.addLayer(
            {
              id: "add-3d-buildings",
              source: "composite",
              "source-layer": "building",
              filter: ["==", "extrude", "true"],
              type: "fill-extrusion",
              minzoom: MIN_ZOOM,
              paint: {
                "fill-extrusion-color": BUILDING_FILL_COLOR,
                // Use an 'interpolate' expression to
                // add a smooth transition effect to
                // the buildings as the user zooms in.
                "fill-extrusion-height": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  15,
                  0,
                  15.05,
                  ["get", "height"],
                ],
                "fill-extrusion-base": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  15,
                  0,
                  15.05,
                  ["get", "min_height"],
                ],
                "fill-extrusion-opacity": BUILDING_FILL_OPACITY,
              },
            },
            labelLayerId
          );

          // Put layers on top of layer-view hierarchy, update font-size
          layers
            ?.filter((layer: mapboxgl.AnyLayer) => layer.id.includes("label"))
            .forEach((layer: mapboxgl.AnyLayer) => {
              map.current?.moveLayer(layer.id);
              map.current?.setLayoutProperty(layer.id, "text-size", 16);
            });
          markerManager.updateMarkers();
          _setupControls();
          _updateInterval = _setupUpdateInterval();
          map.current?.resize();
          // Perform page-switch cleanup operations
          [].slice
            .call(document.getElementsByClassName("nav-link"))
            .forEach((navlink: HTMLAnchorElement) =>
              navlink.addEventListener("click", _cleanup)
            );
        });
      }
    }
  });

  useLayoutEffect(() => {
    map.current?.on("move", () => {
      if (typeof map.current !== "undefined") {
        setLng(+map.current.getCenter().lng.toFixed(4));
        setLat(+map.current.getCenter().lat.toFixed(4));
        setZoom(+map.current.getZoom().toFixed(2));
      }
    });
  });

  useLayoutEffect(() => {
    const message_box = document.getElementById("info-message-box");
    if (message_box) {
      message_box.style.visibility = _loadingMarkers ? "visible" : "hidden";
      setTimeout(() => {
        console.error("Failed to load markers...");
        message_box.classList.add("failed");
        message_box.textContent = "Marker Update Failed!";
      }, LOADING_MARKERS_TIMEOUT);
    }
  }, [_loadingMarkers]);

  return <div ref={mapContainer} className="map-container"></div>;
};

export default Map;
