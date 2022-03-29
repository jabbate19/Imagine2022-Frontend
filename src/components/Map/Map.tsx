import React, { useRef, useState, useLayoutEffect, createRef } from "react";
import mapboxgl from "mapbox-gl";
import MarkerManager from "./Markers";

import "../../../node_modules/mapbox-gl/dist/mapbox-gl.css";
import "./Map.scss";

const MARKER_UPDATE_INTERAL_MS = 1000;

const STARTING_COORDINATES = [43.08492599904675, -77.6674244050181];
const STARTING_PITCH = 45;
const STARTING_BEARING = -17.6;
const STARTING_ZOOM = 19;
const MIN_ZOOM = 17;
const BUILDING_FILL_COLOR = "#BC4A3C";
const BUILDING_FILL_OPACITY = 0.9;
const MAX_BOUNDS = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(-77.687769, 43.078269),
  new mapboxgl.LngLat(-77.653682, 43.092718)
);

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || "";

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
}

const Map: React.FunctionComponent = () => {
  const mapContainer: React.RefObject<HTMLDivElement> = createRef();
  const map = useRef<mapboxgl.Map>();
  const markerManager = new MarkerManager(map);
  const [_lat, setLat] = useState(STARTING_COORDINATES[0]);
  const [_long, setLng] = useState(STARTING_COORDINATES[1]);
  const [zoom, setZoom] = useState(STARTING_ZOOM);

  function setupControls(): void {
    map.current?.addControl(new mapboxgl.NavigationControl());
    map.current?.addControl(new mapboxgl.FullscreenControl());
    map.current?.addControl(new HelloWorldControl());
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
    }
    map.current?.on("load", () => {
      // Insert the layer beneath any symbol layer.
      const layers = map.current?.getStyle().layers;
      const labelLayerId: string | undefined = layers?.find((layer: any) => {
        let text_field: mapboxgl.Layout = layer.layout;
        return layer.type === "symbol" && text_field?.hasOwnProperty("id");
      })?.id;
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
        ?.filter((layer) => layer.id.includes("label"))
        .forEach((layer) => {
          map.current?.moveLayer(layer.id);
          map.current?.setLayoutProperty(layer.id, "text-size", 16);
        });
    });
    setupControls();
    markerManager.addMarker("Tester", { latitude: _lat, longitude: _long });
    console.log(markerManager._geojson);
    setInterval(() => markerManager.updateMarkers(), MARKER_UPDATE_INTERAL_MS);
    map.current?.resize();

    /*
    Zoom resizing for markers -> do this later, in MarkerManager

    map.current?.on("zoom", () => {
      console.log("Zoom");
      for (const feature of markerManager._geojson.features) {
        const zoom = map.current?.getZoom() || 1;
        const scalePercent = 1 + zoom - 8 * 0.4;
        const svgElement = document
          .getElementById(feature.name)
          ?.getElementsByTagName("svg")[0];
        if (svgElement) {
          svgElement.style.transform = `scale(${scalePercent})`;
          svgElement.style.transformOrigin = "bottom";
        }
      }
    });*/
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
