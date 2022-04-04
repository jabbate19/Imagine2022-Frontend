import React, { useRef, useState, useLayoutEffect, createRef } from "react";
import mapboxgl from "mapbox-gl";
import MarkerManager from "./Markers";

import * as APIMiddleware from "./APIMiddleware";

import "../../../node_modules/mapbox-gl/dist/mapbox-gl.css";
import "./Map.scss";

const MARKER_UPDATE_INTERAL_MS = 10000;

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

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || "";

/*
Commented for future reference

class HelloWorldControl {
  _map: mapboxgl.Map | undefined;
  _container: HTMLDivElement | undefined;

  onAdd(map: mapboxgl.Map) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl";
    this._container.textContent = "Hello, world";
    return this._container;
  }

  onRemove() {
    this._container?.parentNode?.removeChild(this._container);
    this._map = undefined;
  }
}*/

const Map: React.FunctionComponent = () => {
  const mapContainer: React.RefObject<HTMLDivElement> = createRef();
  const map = useRef<mapboxgl.Map>();
  const markerManager = new MarkerManager(map);
  const [_lat, setLat] = useState(STARTING_COORDINATES[0]);
  const [_long, setLng] = useState(STARTING_COORDINATES[1]);
  const [zoom, setZoom] = useState(STARTING_ZOOM);
  function _setupControls() {
    map.current?.addControl(new mapboxgl.NavigationControl());
    map.current?.addControl(new mapboxgl.FullscreenControl());
    //map.current?.addControl(new HelloWorldControl()); Commented for future reference
  }

  async function _updateBeaconMarkers() {
    let beacons = await APIMiddleware.retrieveBeacons();
    markerManager.updateHackerLocations(beacons);
    // Update map with any new markers in markerManager._geojson
    markerManager.updateMarkers();
  }

  function _setupUpdateInterval() {
    setInterval(() => {
      // Update markerManager._geojson with beacon locations
      _updateBeaconMarkers();
    }, MARKER_UPDATE_INTERAL_MS);
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
          _setupUpdateInterval();
          map.current?.resize();
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
  return <div ref={mapContainer} className="map-container"></div>;
};

export default Map;
